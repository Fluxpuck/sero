import { Request, Response, Router, NextFunction } from "express";
import { LevelMultiplier } from "../../../../models";
import { ResponseHandler } from "../../../../utils/response.utils";
import { calculateXp } from "../../../../utils/levels.utils";
import { logUserExperience } from "../../../../utils/log.utils";
import { UserExperienceLogType } from "../../../../models/user-experience-logs.model";
import { sequelize } from "../../../../database/sequelize";
import { getOrCreateUserLevel } from "./index";

const router = Router({ mergeParams: true });

/*
This route is for naturally increasing a user's level
by the default 15-25 experience per message
including the personal and guild multiplier
*/

/**
 * @swagger
 * /guild/{guildId}/levels/gain/{userId}:
 *   post:
 *     summary: Increase a user's level by default amount (15-25) including multipliers
 *     tags:
 *       - Levels
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
 *               username:
 *                 type: string
 *                 description: The username of the user
 *     responses:
 *       200:
 *         description: User level updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserLevel'
 */
router.post(
  "/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction();

    try {
      const { guildId, userId } = req.params;

      // Get or create user level
      const [userLevel, created] = await getOrCreateUserLevel(
        guildId,
        userId,
        transaction
      );

      // Get Guild and User multipliers (if any)
      const guild_multiplier = await LevelMultiplier.findOne({
        where: { guildId },
      });
      const user_multiplier = await LevelMultiplier.findOne({
        where: { guildId, userId },
      });

      // Calculate gain based on multipliers
      const gain = calculateXp(
        guild_multiplier?.amount,
        user_multiplier?.amount
      );

      // Update user level
      userLevel.experience += gain;
      await userLevel.save({ transaction });

      await transaction.commit();

      ResponseHandler.sendSuccess(
        res,
        userLevel,
        `User given ${gain} experience`
      );

      // Log the user experience gain
      logUserExperience(guildId, userId, UserExperienceLogType.GAIN, gain);
    } catch (error) {
      transaction.rollback();
      next(error);
    }
  }
);

export default router;
