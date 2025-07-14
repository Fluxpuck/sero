import { Request, Response, Router, NextFunction } from "express";
import { Messages } from "../../../../models";
import { ResponseHandler } from "../../../../utils/response.utils";
import { sequelize } from "../../../../database/sequelize";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /guild/{guildId}/message:
 *   get:
 *     summary: Get messages for a specific guild
 *     tags:
 *       - Guild Messages
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: The ID of the guild to fetch messages for.
 *         schema:
 *           type: integer
 *       - name: startDate
 *         in: query
 *         required: false
 *         description: Start date for filtering messages (YYYY-MM-DD format).
 *         schema:
 *           type: string
 *       - name: endDate
 *         in: query
 *         required: false
 *         description: End date for filtering messages (YYYY-MM-DD format).
 *         schema:
 *           type: string
 *       - name: channelId
 *         in: query
 *         required: false
 *         description: The ID of the channel to filter messages by.
 *         schema:
 *           type: integer
 *       - name: userId
 *         in: query
 *         required: false
 *         description: The ID of the user to filter messages by.
 *         schema:
 *           type: integer
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { guildId } = req.params;
    const { startDate, endDate, channelId, userId } = req.query;

    // Build options for the query
    const options: any = {};

    // Parse channelId if provided
    if (channelId) {
      options.channelId = channelId;
    }

    // Parse userId if provided
    if (userId) {
      options.userId = userId;
    }

    // Parse date range if both start and end dates are provided
    if (startDate && endDate) {
      options.dateRange = {
        startDate: new Date(startDate as string),
        endDate: new Date(endDate as string),
      };
    } // Fetch messages using the findByGuildId method
    const messages = await Messages.findByGuildId(guildId, options);

    // Send standardized successful response
    ResponseHandler.sendSuccess(
      res,
      messages,
      "Messages retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /guild/{guildId}/message:
 *   post:
 *     summary: Create a new message for a guild
 *     tags:
 *       - Guild Messages
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: The ID of the guild to create a message for.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - channelId
 *               - userId
 *               - content
 *             properties:
 *               channelId:
 *                 type: string
 *                 description: The Discord channel ID where the message was sent
 *               userId:
 *                 type: string
 *                 description: The Discord user ID who sent the message
 *               content:
 *                 type: string
 *                 description: The content of the message
 *               messageId:
 *                 type: string
 *                 description: The Discord message ID (optional)
 *     responses:
 *       201:
 *         description: Message created successfully
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
 *                   example: 201
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await sequelize.transaction(async (transaction) => {
    const { guildId } = req.params;
    const { channelId, userId, messageId, content = "" } = req.body;

    // Validate required fields
    if (!channelId || !userId || !messageId) {
      return ResponseHandler.sendValidationFail(
        res,
        "Missing required fields",
        ["channelId, userId, and messageId are required fields"]
      );
    }

    // Create the message object as a plain object with explicit types
    const messageData = {
      guildId: guildId,
      channelId: channelId,
      userId: userId,
      content: content,
      messageId: messageId,
    } as Messages;

    // Create the message in the database
    const message = await Messages.create(messageData, { transaction });

    // Send standardized successful response
    ResponseHandler.sendSuccess(
      res,
      message,
      "Message created successfully",
      201
    );
  });
  } catch (error) {
    next(error);
  }
});

export default router;
