import { Request, Response, Router, NextFunction } from "express";
import { ResponseHandler } from "../../../utils/response.utils";
import { ResponseCode } from "../../../utils/response.types";
import { CommandLogs } from "../../../models";
import { Op } from "sequelize";
import { logger } from "../../../utils/logger";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /logs/{guildId}/command:
 *   get:
 *     summary: Get command logs for a specific guild with optional filtering
 *     tags:
 *       - Logs
 *     parameters:
 *       - in: path
 *         name: guildId
 *         required: true
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *       - in: query
 *         name: commandName
 *         description: Filter by command name
 *         schema:
 *           type: string
 *       - in: query
 *         name: executorId
 *         description: Filter by executor ID
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         description: Number of records to return
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         description: Number of records to skip
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: startDate
 *         description: Filter by start date (ISO format)
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: endDate
 *         description: Filter by end date (ISO format)
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: sortBy
 *         description: Field to sort by
 *         schema:
 *           type: string
 *           enum: [id, commandName, executorId, createdAt, updatedAt]
 *           default: createdAt
 *       - in: query
 *         name: sortOrder
 *         description: Sort direction
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *     responses:
 *       200:
 *         description: Command logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 total:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CommandLogs'
 *       500:
 *         description: Server error
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { guildId } = req.params;
    const {
      commandName,
      executorId,
      limit = 50,
      offset = 0,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = req.query;

    // Build query conditions
    const whereConditions: any = { guildId };

    if (commandName) {
      whereConditions.commandName = commandName;
    }

    if (executorId) {
      whereConditions.executorId = executorId;
    }

    // Date range filtering
    if (startDate || endDate) {
      whereConditions.createdAt = {};

      if (startDate) {
        whereConditions.createdAt[Op.gte] = new Date(startDate as string);
      }

      if (endDate) {
        whereConditions.createdAt[Op.lte] = new Date(endDate as string);
      }
    }

    // Validate sort parameters
    const validSortColumns = [
      "id",
      "commandName",
      "executorId",
      "createdAt",
      "updatedAt",
    ];
    const validSortOrders = ["ASC", "DESC"];

    const sortColumn = validSortColumns.includes(sortBy as string)
      ? sortBy
      : "createdAt";
    const order = validSortOrders.includes((sortOrder as string).toUpperCase())
      ? (sortOrder as string).toUpperCase()
      : "DESC";

    // Get total count for pagination
    const count = await CommandLogs.count({ where: whereConditions });

    // Get logs with pagination and sorting
    const logs = await CommandLogs.findAll({
      where: whereConditions,
      limit: Number(limit),
      offset: Number(offset),
      order: [[sortColumn as string, order]],
    });

    return ResponseHandler.sendSuccess(res, {
      total: count,
      limit: Number(limit),
      offset: Number(offset),
      data: logs,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /logs/{guildId}/command:
 *   post:
 *     summary: Create a new command log entry
 *     tags:
 *       - Logs
 *     parameters:
 *       - in: path
 *         name: guildId
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
 *             properties:
 *               commandName:
 *                 type: string
 *                 description: Name of the command executed
 *               executorId:
 *                 type: string
 *                 description: Discord ID of the user who executed the command
 *               commandOptions:
 *                 type: object
 *                 description: Options provided with the command
 *     responses:
 *       201:
 *         description: Command log created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/CommandLogs'
 *       400:
 *         description: Bad request - missing required fields
 *       500:
 *         description: Server error
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { guildId } = req.params;
    const { commandName, executorId, commandOptions } = req.body;

    // Validate required fields
    if (!guildId) {
      return ResponseHandler.sendValidationFail(
        res,
        "Missing required fields",
        ["guildId is required"]
      );
    }

    logger.debug("Command log details", {
      guildId,
      commandName,
      executorId,
      commandOptions,
    });

    // Create new command log
    const newLog = await CommandLogs.create({
      guildId,
      commandName: commandName || null,
      executorId: executorId || null,
      commandOptions: commandOptions || null,
    } as any);

    return ResponseHandler.sendSuccess(
      res,
      newLog,
      "Command log created successfully",
      ResponseCode.CREATED
    );
  } catch (error) {
    next(error);
  }
});

export default router;
