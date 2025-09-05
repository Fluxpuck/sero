import { Request, Response, Router, NextFunction } from "express";
import {
  TemplateMessages,
  TemplateMessagesType,
} from "../../models/template-messages.model";
import { ResponseHandler } from "../../utils/response.utils";
import { ResponseCode } from "../../utils/response.types";
import { sequelize } from "../../database/sequelize";
import { cache, invalidateCache } from "../../middleware/cache";

const router = Router();

/**
 * @swagger
 * /assets/template-messages:
 *   get:
 *     summary: Get all template messages
 *     tags:
 *       - Template Messages
 *     parameters:
 *       - name: guildId
 *         in: query
 *         required: false
 *         description: Filter by guild ID
 *         schema:
 *           type: string
 *       - name: type
 *         in: query
 *         required: false
 *         description: Filter by message type
 *         schema:
 *           type: string
 *           enum: [welcome, birthday, job, levelup, reward-drop, claim-reward, treasure]
 *     responses:
 *       200:
 *         description: Successful operation
 *       500:
 *         description: Server error
 */
router.get("/", cache({ ttl: 60 * 1 }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { guildId, type } = req.query;
    const where: any = {};

    if (guildId) {
      where.guildId = guildId;
    }

    if (
      type &&
      Object.values(TemplateMessagesType).includes(type as TemplateMessagesType)
    ) {
      where.type = type;
    }

    const templateMessages = await TemplateMessages.findAll({
      where,
    });
    
    const result = templateMessages;

    ResponseHandler.sendSuccess(
      res,
      result,
      "Template messages retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /assets/template-messages/{id}:
 *   get:
 *     summary: Get a specific template message by ID
 *     tags:
 *       - Template Messages
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the template message
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful operation
 *       404:
 *         description: Template message not found
 *       500:
 *         description: Server error
 */
router.get("/:id", cache({ ttl: 60 * 15 }), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const templateMessage = await TemplateMessages.findByPk(id);

    if (!templateMessage) {
      return ResponseHandler.sendError(
        res,
        "Template message not found",
        ResponseCode.NOT_FOUND
      );
    }

    ResponseHandler.sendSuccess(
      res,
      templateMessage,
      "Template message retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /assets/template-messages/guild/{guildId}/type/{type}:
 *   get:
 *     summary: Get a specific template message by guild ID and type
 *     tags:
 *       - Template Messages
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: Guild ID
 *         schema:
 *           type: string
 *       - name: type
 *         in: path
 *         required: true
 *         description: Message type
 *         schema:
 *           type: string
 *           enum: [welcome, birthday, job, levelup, reward-drop, claim-reward, treasure]
 *     responses:
 *       200:
 *         description: Successful operation
 *       404:
 *         description: Template message not found
 *       500:
 *         description: Server error
 */
/**
 * @swagger
 * /assets/template-messages/random/{type}:
 *   get:
 *     summary: Get a random template message of a specific type
 *     tags:
 *       - Template Messages
 *     parameters:
 *       - name: type
 *         in: path
 *         required: true
 *         description: Message type
 *         schema:
 *           type: string
 *           enum: [welcome, birthday, job, levelup, reward-drop, claim-reward, treasure]
 *       - name: guildId
 *         in: query
 *         required: false
 *         description: Filter by guild ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *       404:
 *         description: No template messages found for the specified type
 *       500:
 *         description: Server error
 */
router.get(
  "/random/:type",
  cache({
    ttl: 60 * 1,
    keyGenerator: (req) => `template-messages-random-${req.params.type}-${req.query.guildId || 'global'}`
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type } = req.params;
      const { guildId } = req.query;
      
      if (
        !Object.values(TemplateMessagesType).includes(
          type as TemplateMessagesType
        )
      ) {
        return ResponseHandler.sendValidationFail(
          res,
          "Invalid template message type",
          [`Valid types are: ${Object.values(TemplateMessagesType).join(", ")}`]
        );
      }
      
      const where: any = { type };
      
      if (guildId) {
        where.guildId = guildId;
      }
      
      const templateMessages = await TemplateMessages.findAll({
        where,
      });
      
      if (!templateMessages || templateMessages.length === 0) {
        return ResponseHandler.sendError(
          res,
          "No template messages found for the specified type",
          ResponseCode.NOT_FOUND
        );
      }
      
      // Select a random message from the array
      const randomIndex = Math.floor(Math.random() * templateMessages.length);
      const randomMessage = templateMessages[randomIndex];
      
      ResponseHandler.sendSuccess(
        res,
        randomMessage,
        "Random template message retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  "/guild/:guildId/type/:type",
  cache({
    ttl: 60 * 15,
    keyGenerator: (req) => `template-messages-guild-${req.params.guildId}-type-${req.params.type}`
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { guildId, type } = req.params;

      if (
        !Object.values(TemplateMessagesType).includes(
          type as TemplateMessagesType
        )
      ) {
        return ResponseHandler.sendValidationFail(
          res,
          "Invalid template message type",
          [`Valid types are: ${Object.values(TemplateMessagesType).join(", ")}`]
        );
      }

      const templateMessage = await TemplateMessages.findOne({
        where: {
          guildId,
          type,
        },
      });

      if (!templateMessage) {
        return ResponseHandler.sendError(
          res,
          "Template message not found",
          ResponseCode.NOT_FOUND
        );
      }

      ResponseHandler.sendSuccess(
        res,
        templateMessage,
        "Template message retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /assets/template-messages:
 *   post:
 *     summary: Create or update a template message
 *     tags:
 *       - Template Messages
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               guildId:
 *                 type: string
 *                 description: Guild ID (can be null for global templates)
 *               type:
 *                 type: string
 *                 enum: [welcome, birthday, job, levelup, reward-drop, claim-reward, treasure]
 *                 description: Type of the template message
 *               message:
 *                 type: string
 *                 description: Message content
 *     responses:
 *       200:
 *         description: Template message updated successfully
 *       201:
 *         description: Template message created successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
router.post("/", invalidateCache("api-cache:"), async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { guildId, type, message } = req.body;

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
    if (!Object.values(TemplateMessagesType).includes(type)) {
      await transaction.rollback();
      return ResponseHandler.sendValidationFail(
        res,
        "Invalid template message type",
        [`Valid types are: ${Object.values(TemplateMessagesType).join(", ")}`]
      );
    }

    // Prepare template message data for upsert
    const templateMessageData = {
      guildId: guildId || null,
      type,
      message,
    } as any; // Using 'any' to bypass TypeScript's strict checking

    // Find existing record to determine if this is an update or create
    const existingMessage = await TemplateMessages.findOne({
      where: {
        guildId: guildId || null,
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
      result = await TemplateMessages.create(templateMessageData, {
        transaction,
      });
      created = true;
    }

    await transaction.commit();

    ResponseHandler.sendSuccess(
      res,
      result,
      created
        ? "Template message created successfully"
        : "Template message updated successfully",
      created ? ResponseCode.CREATED : ResponseCode.SUCCESS
    );
  } catch (error) {
    console.error("Error creating or updating template message:", error);
    await transaction.rollback();
    next(error);
  }
});

/**
 * @swagger
 * /assets/template-messages/{id}:
 *   delete:
 *     summary: Delete a template message
 *     tags:
 *       - Template Messages
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the template message to delete
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Template message deleted successfully
 *       404:
 *         description: Template message not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  invalidateCache("api-cache:"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const templateMessage = await TemplateMessages.findByPk(id);

      if (!templateMessage) {
        return ResponseHandler.sendError(
          res,
          "Template message not found",
          ResponseCode.NOT_FOUND
        );
      }

      await templateMessage.destroy();

      ResponseHandler.sendSuccess(
        res,
        { id },
        "Template message deleted successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

export default router;
