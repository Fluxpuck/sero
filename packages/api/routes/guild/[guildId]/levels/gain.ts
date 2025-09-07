import { Request, Response, Router, NextFunction } from "express";
import { Modifier, Guild, User } from "../../../../models";
import { ResponseHandler } from "../../../../utils/response.utils";
import { calculateXp } from "../../../../utils/levels.utils";
import { logUserExperience } from "../../../../utils/log.utils";
import { UserExperienceLogType } from "../../../../models/user-experience-logs.model";
import { sequelize } from "../../../../database/sequelize";
import { getOrCreateUserLevel } from "./index";
import { ResponseCode } from "../../../../utils/response.types";

const router = Router({ mergeParams: true });

/*
This route is for naturally increasing a user's level
by the default 15-25 experience per message
including the personal and guild modifiers
*/

/**
 * @swagger
 * /guild/{guildId}/levels/gain/{userId}:
 *   post:
 *     summary: Increase a user's level by default amount (15-25) including modifiers
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

      // // Check if guild has premium
      // const guild = await Guild.findOne({ where: { guildId } });
      // if (!guild || !guild.hasPremium()) {
      //   await transaction.rollback();
      //   return ResponseHandler.sendError(
      //     res,
      //     "This guild does not have premium. Level updates are disabled.",
      //     403
      //   );
      // }

      // Get Guild and User modifiers
      const guild_modifier = await Modifier.findOne({ where: { guildId } });
      const user_modifier = await Modifier.findOne({
        where: { guildId, userId },
      });

      // Calculate gain based on modifiers
      const gain = calculateXp(guild_modifier?.amount, user_modifier?.amount);

      // Get or create user level
      const [userLevel, created] = await getOrCreateUserLevel(
        guildId,
        userId,
        transaction
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
