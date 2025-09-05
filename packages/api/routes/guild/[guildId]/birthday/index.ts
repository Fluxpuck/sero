import { Request, Response, Router, NextFunction } from "express";
import { UserBirthdays } from "../../../../models";
import { ResponseHandler } from "../../../../utils/response.utils";
import { ResponseCode } from "../../../../utils/response.types";
import { sequelize } from "../../../../database/sequelize";
import { Op } from "sequelize";
import {
  format,
  addDays,
  getMonth,
  getDate,
  differenceInYears,
} from "date-fns";

const router = Router({ mergeParams: true });

// Helper function to calculate age and isPG
const calculateAgeAndPG = (birthdayData: any) => {
  let age = null;
  let isPG = false;

  if (birthdayData.year) {
    const birthDate = new Date(
      birthdayData.year,
      birthdayData.month - 1,
      birthdayData.day
    );
    age = differenceInYears(new Date(), birthDate);
    isPG = age >= 13;
  }

  return {
    ...birthdayData,
    age,
    isPG,
  };
};

/**
 * @swagger
 * /guild/{guildId}/birthday:
 *   get:
 *     summary: Get all birthdays for a guild
 *     tags:
 *       - Birthdays
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserBirthdays'
 *       500:
 *         description: Server error
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { guildId } = req.params;

    const birthdays = await UserBirthdays.findAll({
      where: { guildId },
    });

    // Apply age and isPG calculation to each birthday
    const birthdaysWithAge = birthdays.map((birthday) =>
      calculateAgeAndPG(birthday.toJSON())
    );

    ResponseHandler.sendSuccess(
      res,
      birthdaysWithAge,
      "Birthdays retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /guild/{guildId}/birthday/today:
 *   get:
 *     summary: Get all birthdays for today in a guild
 *     tags:
 *       - Birthdays
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserBirthdays'
 *       500:
 *         description: Server error
 */
router.get(
  "/today",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { guildId } = req.params;

      // Get current date using date-fns
      const today = new Date();
      const currentMonth = getMonth(today) + 1; // date-fns months are 0-indexed
      const currentDay = getDate(today);

      // Simple condition: match current month and day
      const dateConditions = {
        month: currentMonth,
        day: currentDay,
      };

      const birthdays = await UserBirthdays.findAll({
        where: {
          guildId,
          ...dateConditions,
        },
      });

      // Apply age and isPG calculation to each birthday
      const birthdaysWithAge = birthdays.map((birthday) =>
        calculateAgeAndPG(birthday.toJSON())
      );

      ResponseHandler.sendSuccess(
        res,
        birthdaysWithAge,
        "Today's birthdays retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /guild/{guildId}/birthday/upcoming:
 *   get:
 *     summary: Get upcoming birthdays for a guild within the next specified days
 *     tags:
 *       - Birthdays
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *       - name: days
 *         in: query
 *         required: false
 *         description: Number of days to look ahead (default: 7)
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Server error
 */
router.get(
  "/upcoming",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { guildId } = req.params;
      const days = parseInt(req.query.days as string) || 7;

      // Get current date using date-fns
      const today = new Date();

      // Define the type for date entries
      interface DateEntry {
        month: number;
        day: number;
        formattedDate: string;
      }

      // Calculate dates for the next 'days' days using date-fns
      const upcomingDates: DateEntry[] = [];
      for (let i = 0; i < days; i++) {
        const date = addDays(today, i);
        upcomingDates.push({
          month: getMonth(date) + 1, // date-fns months are 0-indexed
          day: getDate(date),
          formattedDate: format(date, "MMM d"), // For debugging/logging
        });
      }

      // No special handling for leap years - just use the dates as they are

      // Create query conditions for each upcoming date
      const dateConditions = upcomingDates.map((date) => ({
        [Op.and]: [{ month: date.month }, { day: date.day }],
      }));

      const birthdays = await UserBirthdays.findAll({
        where: {
          guildId,
          [Op.or]: dateConditions,
        },
      });

      // Add calculated fields for upcoming date, age, and isPG
      const birthdaysWithExtras = birthdays.map((birthday) => {
        const birthdayData = birthday.toJSON();
        const birthdayDate = upcomingDates.find(
          (date) => date.month === birthday.month && date.day === birthday.day
        );

        // Add age and isPG, then add upcomingDate
        const withAgeAndPG = calculateAgeAndPG(birthdayData);

        return {
          ...withAgeAndPG,
          upcomingDate:
            birthdayDate?.formattedDate ||
            format(
              new Date(today.getFullYear(), birthday.month - 1, birthday.day),
              "MMM d"
            ),
        };
      });

      ResponseHandler.sendSuccess(
        res,
        birthdaysWithExtras,
        `Upcoming birthdays for the next ${days} days retrieved successfully`
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /guild/{guildId}/birthday/{userId}:
 *   get:
 *     summary: Get birthday for a specific user in a guild
 *     tags:
 *       - Birthdays
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *       - name: userId
 *         in: path
 *         required: true
 *         description: The Discord ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *       404:
 *         description: Birthday not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { guildId, userId } = req.params;

      const birthday = await UserBirthdays.findOne({
        where: {
          guildId,
          userId,
        },
      });

      if (!birthday) {
        return ResponseHandler.sendError(
          res,
          "Birthday not found for this user",
          ResponseCode.NOT_FOUND
        );
      }

      // Apply age and isPG calculation
      const birthdayWithAge = calculateAgeAndPG(birthday.toJSON());

      ResponseHandler.sendSuccess(
        res,
        birthdayWithAge,
        "Birthday retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /guild/{guildId}/birthday/{userId}:
 *   post:
 *     summary: Create or update a birthday for a user
 *     tags:
 *       - Birthdays
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *       - name: userId
 *         in: path
 *         required: true
 *         description: The Discord ID of the user
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               year:
 *                 type: integer
 *                 description: Birth year (optional)
 *               month:
 *                 type: integer
 *                 description: Birth month (1-12)
 *               day:
 *                 type: integer
 *                 description: Birth day (1-31)
 *     responses:
 *       200:
 *         description: Birthday updated successfully
 *       201:
 *         description: Birthday created successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
router.post(
  "/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction();

    try {
      const { guildId, userId } = req.params;
      const { year, month, day } = req.body;

      // Validate required fields
      if (!month || !day) {
        await transaction.rollback();
        return ResponseHandler.sendValidationFail(
          res,
          "Missing required fields",
          ["month and day are required fields"]
        );
      }

      // Validate month and day
      if (month < 1 || month > 12) {
        await transaction.rollback();
        return ResponseHandler.sendValidationFail(res, "Invalid month", [
          "Month must be between 1 and 12",
        ]);
      }

      // Get the number of days in the specified month using date-fns
      // Use a leap year (2024) for February to allow Feb 29
      const yearToUse = month === 2 ? 2024 : year || 2000;
      const daysInMonth = new Date(yearToUse, month, 0).getDate();

      if (day < 1 || day > daysInMonth) {
        await transaction.rollback();
        return ResponseHandler.sendValidationFail(res, "Invalid day", [
          `Day must be between 1 and ${daysInMonth} for the specified month`,
        ]);
      }

      // Validate year if provided
      if (year && (year < 1900 || year > 2100)) {
        await transaction.rollback();
        return ResponseHandler.sendValidationFail(res, "Invalid year", [
          "Year must be between 1900 and 2100",
        ]);
      }

      // Prepare birthday data for upsert
      const birthdayData = {
        guildId,
        userId,
        year: year || null,
        month,
        day,
      } as UserBirthdays;

      // Use upsert to create or update in a single operation
      const [birthday, created] = await UserBirthdays.upsert(birthdayData, {
        transaction,
      });

      await transaction.commit();

      ResponseHandler.sendSuccess(
        res,
        birthday,
        created
          ? "Birthday created successfully"
          : "Birthday updated successfully",
        created ? ResponseCode.CREATED : ResponseCode.SUCCESS
      );
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
);

/**
 * @swagger
 * /guild/{guildId}/birthday/{userId}:
 *   delete:
 *     summary: Delete a birthday for a user
 *     tags:
 *       - Birthdays
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *       - name: userId
 *         in: path
 *         required: true
 *         description: The Discord ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Birthday deleted successfully
 *       404:
 *         description: Birthday not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { guildId, userId } = req.params;

      const deleted = await UserBirthdays.destroy({
        where: {
          guildId,
          userId,
        },
      });

      if (deleted === 0) {
        return ResponseHandler.sendError(
          res,
          "Birthday not found for this user",
          ResponseCode.NOT_FOUND
        );
      }

      ResponseHandler.sendSuccess(
        res,
        null,
        "Birthday deleted successfully",
        ResponseCode.NO_CONTENT
      );
    } catch (error) {
      next(error);
    }
  }
);

export default router;
