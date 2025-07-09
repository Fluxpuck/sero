import { Request, Response, Router, NextFunction } from "express";
import { CommandLogs } from "../../../models";
import { ResponseHandler } from "../../../utils/response.utils";
import { ResponseCode } from "../../../utils/response.types";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /logs/{guildId}/command:
 *   get:
 *     summary: Get all command logs for a guild
 *     tags:
 *       - Command Logs
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
 *                     $ref: '#/components/schemas/CommandLogs'
 *       404:
 *         description: No command logs found for this guild
 *       500:
 *         description: Server error
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { guildId } = req.params;

    const commandLogs = await CommandLogs.findAll({
      where: { guildId },
    });

    if (!commandLogs.length) {
      return ResponseHandler.sendError(
        res,
        "No command logs found for this guild",
        ResponseCode.NOT_FOUND
      );
    }

    ResponseHandler.sendSuccess(
      res,
      commandLogs,
      "Command logs retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /logs/{guildId}/command/{commandId}:
 *   get:
 *     summary: Get a specific command log by ID
 *     tags:
 *       - Command Logs
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *       - name: commandId
 *         in: path
 *         required: true
 *         description: The ID of the command
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
 *                   $ref: '#/components/schemas/CommandLogs'
 *       404:
 *         description: Command log not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:commandId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { guildId, commandId } = req.params;

      const commandLog = await CommandLogs.findOne({
        where: {
          guildId,
          commandId,
        },
      });

      if (!commandLog) {
        return ResponseHandler.sendError(
          res,
          "Command log not found",
          ResponseCode.NOT_FOUND
        );
      }

      ResponseHandler.sendSuccess(
        res,
        commandLog,
        "Command log retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /logs/{guildId}/command:
 *   post:
 *     summary: Create a command log
 *     tags:
 *       - Command Logs
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - commandId
 *               - name
 *             properties:
 *               commandId:
 *                 type: string
 *                 description: Unique identifier for the command
 *               name:
 *                 type: string
 *                 description: Name of the command
 *               executorId:
 *                 type: string
 *                 description: ID of the user who executed the command
 *     responses:
 *       201:
 *         description: Command log created successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await CommandLogs.sequelize!.transaction();

  try {
    const { guildId } = req.params;
    const { commandId, name, executorId } = req.body;

    // Validate required fields
    if (!commandId || !name) {
      return ResponseHandler.sendValidationFail(
        res,
        "Missing required fields",
        ["commandId and name are required fields"]
      );
    }

    // Create the command log
    const commandLog = await CommandLogs.create({
      guildId,
      commandId,
      name,
      executorId: executorId || null,
    } as CommandLogs);

    await transaction.commit();

    ResponseHandler.sendSuccess(
      res,
      commandLog,
      "Command log created successfully",
      ResponseCode.CREATED
    );
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

export default router;