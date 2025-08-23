import { Request, Response, Router, NextFunction } from "express";
import {
  PrereasonMessages,
  ModerationType,
} from "../../models/prereason-messages.model";
import { ResponseHandler } from "../../utils/response.utils";
import { ResponseCode } from "../../utils/response.types";
import { sequelize } from "../../database/sequelize";

const router = Router();

/**
 * @swagger
 * /assets/prereason-messages:
 *   get:
 *     summary: Get all prereason messages
 *     tags:
 *       - Prereason Messages
 *     parameters:
 *       - name: type
 *         in: query
 *         required: false
 *         description: Filter by moderation type
 *         schema:
 *           type: string
 *           enum: [ban, kick, mute, unban, unmute]
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Server error
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type } = req.query;
    const where: any = {};

    if (
      type &&
      Object.values(ModerationType).includes(type as ModerationType)
    ) {
      where.type = type;
    }

    const prereasonMessages = await PrereasonMessages.findAll({
      where,
    });

    ResponseHandler.sendSuccess(
      res,
      prereasonMessages,
      "Prereason messages retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /assets/prereason-messages/{id}:
 *   get:
 *     summary: Get a specific prereason message by ID
 *     tags:
 *       - Prereason Messages
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the prereason message
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful operation
 *       404:
 *         description: Prereason message not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const prereasonMessage = await PrereasonMessages.findByPk(id);

    if (!prereasonMessage) {
      return ResponseHandler.sendError(
        res,
        "Prereason message not found",
        ResponseCode.NOT_FOUND
      );
    }

    ResponseHandler.sendSuccess(
      res,
      prereasonMessage,
      "Prereason message retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /assets/prereason-messages/type/{type}:
 *   get:
 *     summary: Get a specific prereason message by type
 *     tags:
 *       - Prereason Messages
 *     parameters:
 *       - name: type
 *         in: path
 *         required: true
 *         description: Moderation type
 *         schema:
 *           type: string
 *           enum: [ban, kick, mute, unban, unmute]
 *     responses:
 *       200:
 *         description: Successful operation
 *       404:
 *         description: Prereason message not found
 *       500:
 *         description: Server error
 */
router.get(
  "/type/:type",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.params;

      if (!Object.values(ModerationType).includes(type as ModerationType)) {
        return ResponseHandler.sendValidationFail(
          res,
          "Invalid moderation type",
          [`Valid types are: ${Object.values(ModerationType).join(", ")}`]
        );
      }

      const prereasonMessage = await PrereasonMessages.findOne({
        where: {
          type,
        },
      });

      if (!prereasonMessage) {
        return ResponseHandler.sendError(
          res,
          "Prereason message not found",
          ResponseCode.NOT_FOUND
        );
      }

      ResponseHandler.sendSuccess(
        res,
        prereasonMessage,
        "Prereason message retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /assets/prereason-messages:
 *   post:
 *     summary: Create or update a prereason message
 *     tags:
 *       - Prereason Messages
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [ban, kick, mute, unban, unmute]
 *                 description: Type of moderation action
 *               message:
 *                 type: string
 *                 description: Message content
 *     responses:
 *       200:
 *         description: Prereason message updated successfully
 *       201:
 *         description: Prereason message created successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { type, message } = req.body;

    // Validate required fields
    if (!type || !message) {
      await transaction.rollback();
      return ResponseHandler.sendValidationFail(
        res,
        "Missing required fields",
        ["type and message are required fields"]
      );
    }

    // Validate type
    if (!Object.values(ModerationType).includes(type)) {
      await transaction.rollback();
      return ResponseHandler.sendValidationFail(
        res,
        "Invalid moderation type",
        [`Valid types are: ${Object.values(ModerationType).join(", ")}`]
      );
    }

    // Prepare prereason message data for upsert
    const prereasonMessageData = {
      type,
      message,
    } as any; // Using 'any' to bypass TypeScript's strict checking

    // Find existing record to determine if this is an update or create
    const existingMessage = await PrereasonMessages.findOne({
      where: {
        type,
      },
      transaction,
    });

    let result;
    let created = false;

    if (existingMessage) {
      // Update existing record
      existingMessage.message = message;
      result = await existingMessage.save({ transaction });
    } else {
      // Create new record
      result = await PrereasonMessages.create(prereasonMessageData, {
        transaction,
      });
      created = true;
    }

    await transaction.commit();

    ResponseHandler.sendSuccess(
      res,
      result,
      created
        ? "Prereason message created successfully"
        : "Prereason message updated successfully",
      created ? ResponseCode.CREATED : ResponseCode.SUCCESS
    );
  } catch (error) {
    console.error("Error creating or updating prereason message:", error);
    await transaction.rollback();
    next(error);
  }
});

/**
 * @swagger
 * /assets/prereason-messages/{id}:
 *   delete:
 *     summary: Delete a prereason message
 *     tags:
 *       - Prereason Messages
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the prereason message to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Prereason message deleted successfully
 *       404:
 *         description: Prereason message not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const prereasonMessage = await PrereasonMessages.findByPk(id);

      if (!prereasonMessage) {
        return ResponseHandler.sendError(
          res,
          "Prereason message not found",
          ResponseCode.NOT_FOUND
        );
      }

      await prereasonMessage.destroy();

      ResponseHandler.sendSuccess(
        res,
        { id },
        "Prereason message deleted successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

export default router;
