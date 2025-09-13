import { Request, Response, Router, NextFunction } from "express";
import { ResponseHandler } from "../../../../utils/response.utils";
import { sequelize } from "../../../../database/sequelize";
import { getOrCreateUserLevel } from "./index";
import {
  GuildLevelMultiplier,
  UserLevelMultiplier,
} from "../../../../models/multiplier.model";
import { formatDuration } from "date-fns";

function calculateTimeLeft(expireAt: Date | null) {
  if (!expireAt) {
    return {
      timeLeft: null,
      timeLeftString: "",
    };
  }

  const now = Date.now();
  const expireTime = new Date(expireAt).getTime();

  const timeLeft = Math.max(0, Math.floor((expireTime - now) / 1000));
  const timeLeftString = formatDuration({ seconds: timeLeft });

  return {
    timeLeft,
    timeLeftString,
  };
}

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /guild/{guildId}/levels/multiplier
 *   post:
 *     summary: Create or update a server-wide experience multiplier
 *     tags:
 *       - Levels
 *     parameters:
 *       - in: path
 *         name: guildId
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               multiplier:
 *                 type: integer
 *                 description: The multiplier value (1-10)
 *               duration:
 *                 type: integer
 *                 description: Duration in seconds (optional)
 *     responses:
 *       200:
 *         description: Multiplier set successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { guildId } = req.params;
    const { multiplier = 1, duration = null } = req.body;

    // Validate multiplier
    if (multiplier < 1 || multiplier > 10) {
      await transaction.rollback();
      return ResponseHandler.sendValidationFail(res, "Invalid multiplier", [
        "Multiplier must be between 1 and 10",
      ]);
    }

    // Create or update server multiplier using upsert
    const [guildMultiplier] = await GuildLevelMultiplier.upsert(
      {
        guildId,
        multiplier,
        duration,
      } as GuildLevelMultiplier,
      {
        transaction,
        returning: true,
      }
    );

    await transaction.commit();

    return ResponseHandler.sendSuccess(
      res,
      guildMultiplier,
      `Guild multiplier set to ${multiplier}${
        duration ? ` for ${duration} seconds` : ""
      }`
    );
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

/**
 * @swagger
 * /guild/{guildId}/levels/multiplier/{userId}:
 *   post:
 *     summary: Create or update a personal experience multiplier for a user
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               multiplier:
 *                 type: integer
 *                 description: The multiplier value (1-10)
 *               duration:
 *                 type: integer
 *                 description: Duration in seconds (optional)
 *     responses:
 *       200:
 *         description: Multiplier set successfully
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.post(
  "/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction();

    try {
      const { guildId, userId } = req.params;
      const { multiplier = 1, duration = null } = req.body;

      // Validate multiplier
      if (multiplier < 1 || multiplier > 10) {
        await transaction.rollback();
        return ResponseHandler.sendValidationFail(res, "Invalid multiplier", [
          "Multiplier must be between 1 and 10",
        ]);
      }

      // Create or update user level first to ensure the user exists
      await getOrCreateUserLevel(guildId, userId, transaction);

      // Create or update personal multiplier using upsert
      const [personalMultiplier] = await UserLevelMultiplier.upsert(
        {
          guildId,
          userId,
          multiplier,
          duration,
        } as UserLevelMultiplier,
        {
          transaction,
          returning: true,
        }
      );

      await transaction.commit();

      return ResponseHandler.sendSuccess(
        res,
        personalMultiplier,
        `User multiplier for ${userId} set to ${multiplier}${
          duration ? ` for ${duration} seconds` : ""
        }`
      );
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
);

/**
 * @swagger
 * /guild/{guildId}/levels/multiplier:
 *   get:
 *     summary: Get the server multiplier
 *     tags:
 *       - Levels
 *     parameters:
 *       - in: path
 *         name: guildId
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Server multiplier
 *       404:
 *         description: Multiplier not found
 *       500:
 *         description: Server error
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { guildId } = req.params;

    const serverMultiplier = await GuildLevelMultiplier.findOne({
      where: { guildId },
    });

    if (!serverMultiplier) {
      return ResponseHandler.sendSuccess(
        res,
        {
          multiplier: 1,
          hasActiveBoost: false,
          expireAt: null,
          timeLeft: null,
        },
        "No server multiplier found, using default"
      );
    }

    const { timeLeft, timeLeftString } = calculateTimeLeft(
      serverMultiplier?.hasActiveBoost ? serverMultiplier?.expireAt : null
    );

    return ResponseHandler.sendSuccess(
      res,
      {
        ...serverMultiplier.toJSON(),
        timeLeft,
        timeLeftString,
      },
      "Server multiplier retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /guild/{guildId}/levels/multiplier/{userId}:
 *   get:
 *     summary: Get the personal multiplier for a user
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
 *     responses:
 *       200:
 *         description: User multiplier
 *       404:
 *         description: Multiplier not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { guildId, userId } = req.params;

      const personalMultiplier = await UserLevelMultiplier.findOne({
        where: { guildId, userId },
      });

      if (!personalMultiplier) {
        return ResponseHandler.sendSuccess(
          res,
          { multiplier: 1, active: false, expireAt: null, timeLeft: null },
          "No personal multiplier found, using default"
        );
      }

      const { timeLeft, timeLeftString } = calculateTimeLeft(
        personalMultiplier?.hasActiveBoost ? personalMultiplier?.expireAt : null
      );

      return ResponseHandler.sendSuccess(
        res,
        {
          ...personalMultiplier.toJSON(),
          active: personalMultiplier.hasActiveBoost,
          timeLeft,
        },
        "Personal multiplier retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

export default router;
