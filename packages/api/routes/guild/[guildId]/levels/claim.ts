import { Request, Response, Router, NextFunction } from "express";
import { Modifier, Guild, User } from "../../../../models";
import { ResponseHandler } from "../../../../utils/response.utils";
import { logUserExperience } from "../../../../utils/log.utils";
import { UserExperienceLogType } from "../../../../models/user-experience-logs.model";
import { sequelize } from "../../../../database/sequelize";
import { getOrCreateUserLevel } from "./index";

const router = Router({ mergeParams: true });

/*
This route is for claiming the Reward Drop!!
*/

/**
 * @swagger
 * /guild/{guildId}/levels/claim/{userId}:
 *   post:
 *     summary: Claim the reward drop for a user
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
 *               amount:
 *                 type: integer
 *                 description: Optional specific amount to give. If not provided, a random amount within minAmount and maxAmount will be used
 *               minAmount:
 *                 type: integer
 *                 description: Minimum amount for random reward (default 200)
 *               maxAmount:
 *                 type: integer
 *                 description: Maximum amount for random reward (default 500)
 *               originId:
 *                 type: string
 *                 description: Optional ID of the origin of the reward (e.g. bot ID)
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

      // Check if guild has premium
      const guild = await Guild.findOne({ where: { guildId } });
      if (!guild || !guild.hasPremium()) {
        await transaction.rollback();
        return ResponseHandler.sendError(
          res,
          "This guild does not have premium. Level updates are disabled.",
          403
        );
      }

      // Get amount from request body or generate random amount
      const { amount, minAmount = 200, maxAmount = 500, originId } = req.body;

      // Calculate the reward amount
      let rewardAmount: number;

      if (amount !== undefined) {
        // Use specific amount if provided
        rewardAmount = Number(amount);
      } else {
        // Generate random amount between min and max
        const min = Number(minAmount);
        const max = Number(maxAmount);
        rewardAmount = Math.floor(Math.random() * (max - min + 1)) + min;
      }

      // Apply modifiers if needed
      const guild_modifier = await Modifier.findOne({ where: { guildId } });
      const user_modifier = await Modifier.findOne({
        where: { guildId, userId },
      });

      // Apply modifiers to the reward amount if needed
      if (guild_modifier?.amount || user_modifier?.amount) {
        // Apply modifiers as multipliers to the base reward amount
        const guildMod = guild_modifier?.amount || 1;
        const userMod = user_modifier?.amount || 1;
        rewardAmount = Math.ceil(rewardAmount * guildMod * userMod);
      }

      // Get or create user level
      const [userLevel, created] = await getOrCreateUserLevel(
        guildId,
        userId,
        transaction
      );

      // Update user level
      userLevel.experience += rewardAmount;
      await userLevel.save({ transaction });

      await transaction.commit();

      ResponseHandler.sendSuccess(
        res,
        userLevel,
        `User rewarded ${rewardAmount} experience`
      );

      // Log the user experience gain
      logUserExperience(
        guildId,
        userId,
        UserExperienceLogType.CLAIM,
        rewardAmount
      );
    } catch (error) {
      transaction.rollback();
      next(error);
    }
  }
);

export default router;
