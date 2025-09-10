import { Request, Response, Router, NextFunction } from "express";
import { Aways } from "../../../../models";
import { ResponseHandler } from "../../../../utils/response.utils";
import { ResponseCode } from "../../../../utils/response.types";
import { sequelize } from "../../../../database/sequelize";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /guild/{guildId}/away:
 *   get:
 *     summary: Get all away statuses for a guild
 *     tags:
 *       - Away Status
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
 *                     $ref: '#/components/schemas/Aways'
 *       500:
 *         description: Server error
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { guildId } = req.params;

    const aways = await Aways.findAll({
      where: { guildId },
    });

    ResponseHandler.sendSuccess(
      res,
      aways,
      "Away statuses retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /guild/{guildId}/away/{userId}:
 *   get:
 *     summary: Get away status for a specific user in a guild
 *     tags:
 *       - Away Status
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
 *                   $ref: '#/components/schemas/Aways'
 *       404:
 *         description: Away status not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { guildId, userId } = req.params;

      const away = await Aways.findOne({
        where: {
          guildId,
          userId,
        },
      });

      if (!away) {
        return ResponseHandler.sendError(
          res,
          "Away status not found for this user",
          ResponseCode.NOT_FOUND
        );
      }

      ResponseHandler.sendSuccess(
        res,
        away,
        "Away status retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /guild/{guildId}/away/{userId}:
 *   post:
 *     summary: Create or update an away status for a user
 *     tags:
 *       - Away Status
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
 *               message:
 *                 type: string
 *                 description: Away message to display
 *               duration:
 *                 type: integer
 *                 description: Duration in minutes for the away status
 *     responses:
 *       200:
 *         description: Away status updated successfully
 *       201:
 *         description: Away status created successfully
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
      const { message, duration } = req.body;

      // Validate required fields
      if (!duration) {
        return ResponseHandler.sendValidationFail(
          res,
          "Missing required fields",
          ["duration (in minutes) and message are required fields"]
        );
      }

      // Calculate expiration date if duration is provided (in minutes)
      let expireAt = null;
      if (duration) {
        expireAt = new Date();
        expireAt.setMinutes(expireAt.getMinutes() + duration);
      }
      // Prepare away data for upsert
      const awayData = {
        guildId,
        userId,
        message,
        duration,
        expireAt,
      } as Aways;

      // Use upsert to create or update in a single operation
      const [away, created] = await Aways.upsert(awayData);

      await transaction.commit();

      ResponseHandler.sendSuccess(
        res,
        away,
        created
          ? "Away status created successfully"
          : "Away status updated successfully",
        created ? ResponseCode.CREATED : ResponseCode.SUCCESS
      );
    } catch (error) {
      transaction.rollback();
      next(error);
    }
  }
);

/**
 * @swagger
 * /guild/{guildId}/away/{userId}:
 *   delete:
 *     summary: Delete an away status for a user
 *     tags:
 *       - Away Status
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
 *         description: Away status deleted successfully
 *       404:
 *         description: Away status not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { guildId, userId } = req.params;

      const deleted = await Aways.destroy({
        where: {
          guildId,
          userId,
        },
      });

      if (deleted === 0) {
        return ResponseHandler.sendError(
          res,
          "Away status not found for this user",
          ResponseCode.NOT_FOUND
        );
      }

      ResponseHandler.sendSuccess(
        res,
        null,
        "Away status deleted successfully",
        ResponseCode.NO_CONTENT
      );
    } catch (error) {
      next(error);
    }
  }
);

export default router;
