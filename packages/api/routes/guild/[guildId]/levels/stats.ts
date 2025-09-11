import { Request, Response, Router, NextFunction } from "express";
import { Op, fn, col, QueryTypes } from "sequelize";
import {
  subDays,
  subMonths,
  subWeeks,
  format,
  differenceInDays,
  addDays,
} from "date-fns";
import { UserLevel, UserExperienceLogs } from "../../../../models";
import { ResponseHandler } from "../../../../utils/response.utils";
import { sequelize } from "../../../../database/sequelize";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /guild/{guildId}/levels/stats/user/{userId}:
 *   get:
 *     summary: Get detailed statistics for a specific user
 *     tags:
 *       - Levels
 *     parameters:
 *       - in: path
 *         name: guildId
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         description: The Discord ID of the user
 *         schema:
 *           type: string
 *       - in: query
 *         name: period
 *         description: Time period for statistics (day, week, month, all)
 *         schema:
 *           type: string
 *           default: all
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userLevel:
 *                   $ref: '#/components/schemas/UserLevel'
 *                 activityBreakdown:
 *                   type: object
 *                 growthRate:
 *                   type: object
 *                 levelUpPrediction:
 *                   type: object
 *                 personalRecords:
 *                   type: object
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get(
  "/user/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { guildId, userId } = req.params;
      const period = (req.query.period as string) || "all";

      // Get date range based on period
      const dateRange = getDateRange(period);

      // Get or create user level without transaction
      const [userLevel] = await UserLevel.findOrCreate({
        where: { guildId, userId },
        defaults: {
          guildId,
          userId,
        } as UserLevel,
      });

      // Get activity breakdown by type
      const activityBreakdown = await getUserActivityBreakdown(
        guildId,
        userId,
        dateRange
      );

      // Calculate growth rate (average XP gain per day)
      const growthRate = await calculateUserGrowthRate(
        guildId,
        userId,
        dateRange
      );

      // Calculate level-up prediction
      const levelUpPrediction = calculateLevelUpPrediction(
        userLevel,
        growthRate.avgDailyXP
      );

      // Get personal records
      const personalRecords = await getUserPersonalRecords(
        guildId,
        userId,
        dateRange
      );

      // Get position history (rank changes over time)
      const positionHistory = await getUserPositionHistory(
        guildId,
        userId,
        dateRange
      );

      const response = {
        userLevel: userLevel.toJSON(),
        activityBreakdown,
        growthRate,
        levelUpPrediction,
        personalRecords,
        positionHistory,
      };

      return ResponseHandler.sendSuccess(
        res,
        response,
        "User statistics retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /guild/{guildId}/levels/stats/guild:
 *   get:
 *     summary: Get detailed statistics for the entire guild
 *     tags:
 *       - Levels
 *     parameters:
 *       - in: path
 *         name: guildId
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *       - in: query
 *         name: period
 *         description: Time period for statistics (day, week, month, all)
 *         schema:
 *           type: string
 *           default: all
 *     responses:
 *       200:
 *         description: Guild statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 memberCount:
 *                   type: number
 *                 totalExperience:
 *                   type: number
 *                 averageLevel:
 *                   type: number
 *                 activityDistribution:
 *                   type: object
 *                 topGainers:
 *                   type: array
 *                 levelDistribution:
 *                   type: object
 *                 activityHeatmap:
 *                   type: object
 *       404:
 *         description: Guild not found
 *       500:
 *         description: Server error
 */
router.get(
  "/guild",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { guildId } = req.params;
      const period = (req.query.period as string) || "all";

      // Get date range based on period
      const dateRange = getDateRange(period);

      // Get basic guild stats
      const memberCount = await UserLevel.count({
        where: { guildId },
      });

      const totalExperience = await UserLevel.sum("experience", {
        where: { guildId },
      });

      const averageLevel = await UserLevel.findOne({
        attributes: [[fn("AVG", col("level")), "avgLevel"]],
        where: { guildId },
        raw: true,
      });

      // Get activity distribution by type
      const activityDistribution = await getGuildActivityDistribution(
        guildId,
        dateRange
      );

      // Get top gainers for the period
      const topGainers = await getGuildTopGainers(guildId, dateRange);

      // Get level distribution
      const levelDistribution = await getGuildLevelDistribution(guildId);

      // Get activity heatmap (activity by day of week and hour)
      const activityHeatmap = await getGuildActivityHeatmap(guildId, dateRange);

      const response = {
        memberCount,
        totalExperience,
        averageLevel: averageLevel
          ? parseFloat((averageLevel as any).avgLevel)
          : 0,
        activityDistribution,
        topGainers,
        levelDistribution,
        activityHeatmap,
      };

      return ResponseHandler.sendSuccess(
        res,
        response,
        "Guild statistics retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

// Helper functions

/**
 * Get date range based on period using date-fns
 */
function getDateRange(period: string): { startDate: Date; endDate: Date } {
  const endDate = new Date();
  let startDate: Date;

  switch (period) {
    case "day":
      startDate = subDays(endDate, 1);
      break;
    case "week":
      startDate = subWeeks(endDate, 1);
      break;
    case "month":
      startDate = subMonths(endDate, 1);
      break;
    default:
      // "all" - set to a far past date
      startDate = new Date(0); // January 1, 1970
  }

  return { startDate, endDate };
}

/**
 * Get user activity breakdown by type
 */
async function getUserActivityBreakdown(
  guildId: string,
  userId: string,
  dateRange: { startDate: Date; endDate: Date }
) {
  const logs = await UserExperienceLogs.findAll({
    attributes: [
      "type",
      [fn("SUM", col("amount")), "totalAmount"],
      [fn("COUNT", col("id")), "count"],
    ],
    where: {
      guildId,
      userId,
      createdAt: {
        [Op.between]: [dateRange.startDate, dateRange.endDate],
      },
    },
    group: ["type"],
    raw: true,
  });

  // Calculate percentages
  const totalXP = logs.reduce(
    (sum, log) => sum + parseInt((log as any).totalAmount),
    0
  );

  return {
    breakdown: logs.map((log) => ({
      type: log.type,
      totalAmount: parseInt((log as any).totalAmount),
      count: parseInt((log as any).count),
      percentage:
        totalXP > 0
          ? Math.round((parseInt((log as any).totalAmount) / totalXP) * 100)
          : 0,
    })),
    totalXP,
  };
}

/**
 * Calculate user growth rate
 */
async function calculateUserGrowthRate(
  guildId: string,
  userId: string,
  dateRange: { startDate: Date; endDate: Date }
) {
  // Get total XP gained in the period
  const totalXPGained =
    (await UserExperienceLogs.sum("amount", {
      where: {
        guildId,
        userId,
        createdAt: {
          [Op.between]: [dateRange.startDate, dateRange.endDate],
        },
      },
    })) || 0;

  // Calculate days in the period using date-fns
  const daysDiff = Math.max(
    1,
    differenceInDays(dateRange.endDate, dateRange.startDate)
  );

  // Get XP by day for trend analysis
  const result = await sequelize.query(
    `SELECT 
      "createdAt"::date as day,
      SUM(amount) as dailyXP
    FROM user_experience_logs
    WHERE "guildId" = :guildId
      AND "userId" = :userId
      AND "createdAt" BETWEEN :startDate AND :endDate
    GROUP BY "createdAt"::date
    ORDER BY day ASC`,
    {
      replacements: {
        guildId,
        userId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      },
      type: QueryTypes.SELECT,
    }
  );

  // Format dates using date-fns
  const formattedDailyXP = (result as any[]).map((item) => ({
    ...item,
    day: format(new Date(item.day), "yyyy-MM-dd"),
    formattedDay: format(new Date(item.day), "MMM d, yyyy"),
  }));

  return {
    totalXPGained,
    daysDiff,
    avgDailyXP: Math.round(totalXPGained / daysDiff),
    dailyXP: formattedDailyXP,
  };
}

/**
 * Calculate level-up prediction
 */
function calculateLevelUpPrediction(userLevel: UserLevel, avgDailyXP: number) {
  if (avgDailyXP <= 0) {
    return {
      daysToNextLevel: null,
      estimatedDate: null,
    };
  }

  const daysToNextLevel = Math.ceil(userLevel.remainingExp / avgDailyXP);
  const estimatedDate = addDays(new Date(), daysToNextLevel);

  return {
    daysToNextLevel,
    estimatedDate: format(estimatedDate, "yyyy-MM-dd"),
    xpNeeded: userLevel.remainingExp,
    avgDailyXP,
  };
}

/**
 * Get user personal records
 */
async function getUserPersonalRecords(
  guildId: string,
  userId: string,
  dateRange: { startDate: Date; endDate: Date }
) {
  // Largest single XP gain
  const largestGain = await UserExperienceLogs.findOne({
    attributes: ["amount", "type", "createdAt"],
    where: {
      guildId,
      userId,
      createdAt: {
        [Op.between]: [dateRange.startDate, dateRange.endDate],
      },
    },
    order: [["amount", "DESC"]],
    raw: true,
  });

  // Most active day
  const mostActiveDay = await sequelize.query(
    `SELECT 
      "createdAt"::date as day,
      SUM(amount) as totalXP,
      COUNT(*) as activityCount
    FROM user_experience_logs
    WHERE "guildId" = :guildId
      AND "userId" = :userId
      AND "createdAt" BETWEEN :startDate AND :endDate
    GROUP BY "createdAt"::date
    ORDER BY totalXP DESC
    LIMIT 1`,
    {
      replacements: {
        guildId,
        userId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      },
      type: QueryTypes.SELECT,
    }
  );

  return {
    largestGain,
    mostActiveDay: mostActiveDay[0] || null,
  };
}

/**
 * Get user position history
 */
async function getUserPositionHistory(
  guildId: string,
  userId: string,
  dateRange: { startDate: Date; endDate: Date }
) {
  // This would require historical rank data which might not be available
  // For now, return the current position and level
  const userLevel = await UserLevel.findOne({
    where: { guildId, userId },
  });

  if (!userLevel) {
    return {
      currentRank: null,
      currentLevel: null,
    };
  }

  return {
    currentRank: userLevel.rank,
    currentLevel: userLevel.level,
  };
}

/**
 * Get guild activity distribution by type
 */
async function getGuildActivityDistribution(
  guildId: string,
  dateRange: { startDate: Date; endDate: Date }
) {
  const logs = await UserExperienceLogs.findAll({
    attributes: [
      "type",
      [fn("SUM", col("amount")), "totalAmount"],
      [fn("COUNT", col("id")), "count"],
    ],
    where: {
      guildId,
      createdAt: {
        [Op.between]: [dateRange.startDate, dateRange.endDate],
      },
    },
    group: ["type"],
    raw: true,
  });

  // Calculate percentages
  const totalXP = logs.reduce(
    (sum, log) => sum + parseInt((log as any).totalAmount),
    0
  );

  return {
    distribution: logs.map((log) => ({
      type: log.type,
      totalAmount: parseInt((log as any).totalAmount),
      count: parseInt((log as any).count),
      percentage:
        totalXP > 0
          ? Math.round((parseInt((log as any).totalAmount) / totalXP) * 100)
          : 0,
    })),
    totalXP,
  };
}

/**
 * Get guild top gainers for the period
 */
async function getGuildTopGainers(
  guildId: string,
  dateRange: { startDate: Date; endDate: Date }
) {
  return await sequelize.query(
    `SELECT 
      "userId",
      SUM(amount) as totalGained
    FROM user_experience_logs
    WHERE "guildId" = :guildId
      AND "createdAt" BETWEEN :startDate AND :endDate
    GROUP BY "userId"
    ORDER BY totalGained DESC
    LIMIT 10`,
    {
      replacements: {
        guildId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      },
      type: QueryTypes.SELECT,
    }
  );
}

/**
 * Get guild level distribution
 */
async function getGuildLevelDistribution(guildId: string) {
  const levelCounts = await UserLevel.findAll({
    attributes: ["level", [fn("COUNT", col("id")), "count"]],
    where: { guildId },
    group: ["level"],
    order: [["level", "ASC"]],
    raw: true,
  });

  return levelCounts.map((item) => ({
    level: item.level,
    count: parseInt((item as any).count),
  }));
}

/**
 * Get guild activity heatmap
 */
async function getGuildActivityHeatmap(
  guildId: string,
  dateRange: { startDate: Date; endDate: Date }
) {
  const result = await sequelize.query(
    `SELECT 
      EXTRACT(DOW FROM "createdAt") as dayOfWeek,
      EXTRACT(HOUR FROM "createdAt") as hour,
      COUNT(*) as activityCount,
      SUM(amount) as totalXP
    FROM user_experience_logs
    WHERE "guildId" = :guildId
      AND "createdAt" BETWEEN :startDate AND :endDate
    GROUP BY EXTRACT(DOW FROM "createdAt"), EXTRACT(HOUR FROM "createdAt")
    ORDER BY dayOfWeek, hour`,
    {
      replacements: {
        guildId,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      },
      type: QueryTypes.SELECT,
    }
  );

  // Format the result with day names using date-fns
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (result as any[]).map((item) => ({
    ...item,
    dayName: dayNames[item.dayOfWeek - 1], // SQL DAYOFWEEK is 1-based (1=Sunday)
    formattedHour: format(new Date().setHours(item.hour, 0, 0, 0), "h a"),
  }));
}

export default router;
