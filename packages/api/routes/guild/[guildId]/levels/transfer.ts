import { Request, Response, Router, NextFunction } from "express";
import { ResponseHandler } from "../../../../utils/response.utils";
import { logUserExperience } from "../../../../utils/log.utils";
import { UserExperienceLogType } from "../../../../models/user-experience-logs.model";
import { sequelize } from "../../../../database/sequelize";
import { getOrCreateUserLevel } from "./index";
import { checkGuildPremium } from "../../../../utils/premium.utils";
import { ResponseCode } from "../../../../utils/response.types";
import { checkDailyTransferLimit } from "../../../../utils/levels.utils";

/**
 * Validates the transfer input parameters
 */
const validateTransferInput = (
  res: Response,
  targetAmount: number,
  targetId: string,
  originId: string
) => {
  // Validate amount
  if (!targetAmount) {
    return ResponseHandler.sendValidationFail(res, "Missing required fields", [
      "Amount is a required field",
    ]);
  }

  if (targetAmount !== Number(targetAmount)) {
    return ResponseHandler.sendValidationFail(res, "Invalid amount", [
      "Amount must be a number",
    ]);
  }

  // Validate target user ID
  if (!targetId) {
    return ResponseHandler.sendValidationFail(res, "Missing required fields", [
      "Target user ID is required",
    ]);
  }

  // Check if user is trying to transfer to themselves
  if (originId === targetId) {
    return ResponseHandler.sendError(
      res,
      "You cannot transfer experience to yourself",
      ResponseCode.BAD_REQUEST
    );
  }

  return null;
};

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /guild/{guildId}/levels/transfer/{userId}:
 *   post:
 *     summary: Transfer experience from one user to another
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
 *         description: The Discord ID of the user transferring experience
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
 *                 type: number
 *                 description: The amount of experience to transfer
 *               targetId:
 *                 type: string
 *                 description: The Discord ID of the user receiving experience
 *     responses:
 *       200:
 *         description: Experience transferred successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 originUserLevel:
 *                   $ref: '#/components/schemas/UserLevel'
 *                 targetUserLevel:
 *                   $ref: '#/components/schemas/UserLevel'
 *                 transferredAmount:
 *                   type: number
 *       400:
 *         description: Bad request
 *       404:
 *         description: Guild not found
 *       500:
 *         description: Server error
 */
router.post(
  "/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction();

    try {
      const { guildId, userId: originId } = req.params;
      const { amount: targetAmount = 0, targetId } = req.body;

      // Check if guild has premium
      const hasPremium = await checkGuildPremium(guildId, transaction, res);
      if (!hasPremium) return;

      // Validate input
      const validationError = validateTransferInput(
        res,
        targetAmount,
        targetId,
        originId
      );
      if (validationError) return validationError;

      // Get origin user's level
      const [originUserLevel] = await getOrCreateUserLevel(
        guildId,
        originId,
        transaction
      );

      // Check if user has enough experience
      if (originUserLevel.experience <= 0) {
        return ResponseHandler.sendError(
          res,
          "You don't have any experience to transfer",
          ResponseCode.BAD_REQUEST
        );
      }

      // Determine transfer amount (capped by available experience)
      const transferAmount = Math.min(targetAmount, originUserLevel.experience);

      // Check daily transfer limit
      const {
        dailyTransferLimit,
        canTransfer,
        actualTransferAmount,
        remainingTransferLimit,
      } = await checkDailyTransferLimit(
        guildId,
        originId,
        transferAmount,
        transaction
      );

      if (!canTransfer) {
        return ResponseHandler.sendError(
          res,
          "You have reached your daily transfer limit of 2000 experience",
          ResponseCode.BAD_REQUEST
        );
      }

      // Get target user's level
      const [targetUserLevel] = await getOrCreateUserLevel(
        guildId,
        targetId,
        transaction
      );

      // Update both users' experience
      originUserLevel.experience -= actualTransferAmount;
      await originUserLevel.save({ transaction });

      targetUserLevel.experience += actualTransferAmount;
      await targetUserLevel.save({ transaction });

      await transaction.commit();

      // Prepare response message
      let message = `Transferred ${actualTransferAmount} experience from ${originId} to ${targetId}`;
      if (actualTransferAmount < targetAmount) {
        if (remainingTransferLimit <= 0) {
          message += " (daily limit reached)";
        } else {
          message += " (limited by available experience)";
        }
      }

      ResponseHandler.sendSuccess(
        res,
        {
          originUserLevel,
          targetUserLevel,
          dailyTransferLimit,
          actualTransferAmount,
          remainingTransferLimit,
        },
        message
      );

      // Log the transfer for both users
      logUserExperience(
        guildId,
        originId,
        UserExperienceLogType.TRANSFER,
        actualTransferAmount,
        targetId
      );

      logUserExperience(
        guildId,
        targetId,
        UserExperienceLogType.GIVE,
        actualTransferAmount,
        originId
      );
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
);

export default router;
