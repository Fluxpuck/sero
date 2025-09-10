import { Request, Response, Router, NextFunction } from "express";
import {
  UserAuditLogs,
  AuditLogEventType,
} from "../../../../models/user-audit-logs.model";
import { User } from "../../../../models/user.model";
import { ResponseHandler } from "../../../../utils/response.utils";
import { ResponseCode } from "../../../../utils/response.types";
import { sequelize } from "../../../../database/sequelize";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /guild/{guildId}/logs/user:
 *   get:
 *     summary: Get all user audit logs for a guild
 *     tags:
 *       - Logs
 *     parameters:
 *       - in: path
 *         name: guildId
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         description: Maximum number of logs to return
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         description: Number of logs to skip
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: action
 *         description: Filter by audit log action type
 *         schema:
 *           type: string
 *       - in: query
 *         name: targetId
 *         description: Filter by target user ID
 *         schema:
 *           type: string
 *       - in: query
 *         name: executorId
 *         description: Filter by executor user ID
 *         schema:
 *           type: string
 *       - in: query
 *         name: includeUsers
 *         description: Whether to include user data in the response
 *         schema:
 *           type: string
 *           default: "true"
 *     responses:
 *       200:
 *         description: List of user audit logs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserAuditLogs'
 *       404:
 *         description: Guild not found
 *       500:
 *         description: Server error
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { guildId } = req.params;
    const {
      limit = 50,
      offset = 0,
      action,
      targetId,
      executorId,
      includeUsers = "true",
    } = req.query;

    const whereClause: any = { guildId };

    // Add optional filters
    if (action) whereClause.action = action;
    if (targetId) whereClause.targetId = targetId;
    if (executorId) whereClause.executorId = executorId;

    // Prepare find options with optional includes
    const findOptions: any = {
      where: whereClause,
      limit: Number(limit),
      offset: Number(offset),
      order: [["createdAt", "DESC"]],
    };

    // If includeUsers is true, use Sequelize associations for both executor and target data
    if (includeUsers === "true") {
      findOptions.include = [
        {
          model: User,
          as: "executor",
          attributes: ["userId", "username", "userType", "premium"],
          required: false,
        },
        {
          model: User,
          as: "target",
          attributes: ["userId", "username", "userType", "premium"],
          required: false,
        },
      ];
    }

    const auditLogs = await UserAuditLogs.findAll(findOptions);

    return ResponseHandler.sendSuccess(
      res,
      auditLogs,
      "User audit logs retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /guild/{guildId}/logs/user/target/{targetId}:
 *   get:
 *     summary: Get all audit logs for a specific target user
 *     tags:
 *       - Logs
 *     parameters:
 *       - in: path
 *         name: guildId
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *       - in: path
 *         name: targetId
 *         description: The Discord ID of the target user
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         description: Maximum number of logs to return
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         description: Number of logs to skip
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: action
 *         description: Filter by audit log action type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user audit logs for the target user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserAuditLogs'
 *       404:
 *         description: Guild not found
 *       500:
 *         description: Server error
 */
router.get(
  "/target/:targetId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { guildId, targetId } = req.params;
      const {
        limit = 50,
        offset = 0,
        action,
        includeUsers = "true",
      } = req.query;

      const whereClause: any = { guildId, targetId };

      // Add optional action filter
      if (action) whereClause.action = action;

      // Get audit logs with included user data if requested
      const findOptions: any = {
        where: whereClause,
        limit: Number(limit),
        offset: Number(offset),
        order: [["createdAt", "DESC"]],
      };

      // If includeUsers is true, use Sequelize associations for both executor and target data
      if (includeUsers === "true") {
        findOptions.include = [
          {
            model: User,
            as: "executor",
            attributes: ["userId", "username", "userType", "premium"],
            required: false,
          },
          {
            model: User,
            as: "target",
            attributes: ["userId", "username", "userType", "premium"],
            required: false,
          },
        ];
      }

      const auditLogs = await UserAuditLogs.findAndCountAll(findOptions);

      // Return the results with user data included
      return ResponseHandler.sendPaginatedSuccess(
        res,
        auditLogs.rows,
        auditLogs.count,
        Number(offset) + 1,
        Number(limit),
        "Target audit logs retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /guild/{guildId}/logs/user/executor/{executorId}:
 *   get:
 *     summary: Get all audit logs performed by a specific executor
 *     tags:
 *       - Logs
 *     parameters:
 *       - in: path
 *         name: guildId
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *       - in: path
 *         name: executorId
 *         description: The Discord ID of the executor user
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         description: Maximum number of logs to return
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         description: Number of logs to skip
 *         schema:
 *           type: integer
 *           default: 0
 *       - in: query
 *         name: action
 *         description: Filter by audit log action type
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user audit logs performed by the executor
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserAuditLogs'
 *       404:
 *         description: Guild not found
 *       500:
 *         description: Server error
 */
router.get(
  "/executor/:executorId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { guildId, executorId } = req.params;
      const {
        limit = 50,
        offset = 0,
        action,
        includeUsers = "true",
      } = req.query;

      const whereClause: any = { guildId, executorId };

      // Add optional action filter
      if (action) whereClause.action = action;

      // Get audit logs with included user data if requested
      const findOptions: any = {
        where: whereClause,
        limit: Number(limit),
        offset: Number(offset),
        order: [["createdAt", "DESC"]],
      };

      // If includeUsers is true, use Sequelize associations for both executor and target data
      if (includeUsers === "true") {
        findOptions.include = [
          {
            model: User,
            as: "executor",
            attributes: ["userId", "username", "userType", "premium"],
            required: false,
          },
          {
            model: User,
            as: "target",
            attributes: ["userId", "username", "userType", "premium"],
            required: false,
          },
        ];
      }

      const auditLogs = await UserAuditLogs.findAndCountAll(findOptions);

      // Return the results with user data included
      return ResponseHandler.sendPaginatedSuccess(
        res,
        auditLogs.rows,
        auditLogs.count,
        Number(offset) + 1,
        Number(limit),
        "Executor audit logs retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /guild/{guildId}/logs/user:
 *   post:
 *     summary: Create a new user audit log
 *     tags:
 *       - Logs
 *     parameters:
 *       - in: path
 *         name: guildId
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
 *               - action
 *               - targetId
 *               - executorId
 *             properties:
 *               action:
 *                 type: string
 *                 description: The audit log action type
 *               reason:
 *                 type: string
 *                 description: The reason for the action
 *               targetId:
 *                 type: string
 *                 description: The Discord ID of the target user
 *               executorId:
 *                 type: string
 *                 description: The Discord ID of the user who performed the action
 *               duration:
 *                 type: number
 *                 description: Duration in milliseconds (for timeout actions)
 *     responses:
 *       201:
 *         description: User audit log created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserAuditLogs'
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await sequelize.transaction();

  try {
    const { guildId } = req.params;
    const { action, reason, targetId, executorId, duration } = req.body;

    // Validate required fields
    if (!action || !targetId || !executorId) {
      await transaction.rollback();
      return ResponseHandler.sendValidationFail(
        res,
        "Missing required fields",
        [
          !action ? "Action is required" : null,
          !targetId ? "Target ID is required" : null,
          !executorId ? "Executor ID is required" : null,
        ].filter(Boolean)
      );
    }

    // Create the audit log
    const auditLog = await UserAuditLogs.create(
      {
        guildId,
        action: action as AuditLogEventType,
        reason,
        targetId,
        executorId,
        duration,
      } as any,
      { transaction }
    );

    await transaction.commit();

    ResponseHandler.sendSuccess(
      res,
      auditLog,
      "User audit log created successfully",
      ResponseCode.CREATED
    );
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

/**
 * @swagger
 * /guild/{guildId}/logs/user/{id}:
 *   delete:
 *     summary: Delete a specific user audit log
 *     tags:
 *       - Logs
 *     parameters:
 *       - in: path
 *         name: guildId
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         description: The ID of the user audit log to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User audit log deleted successfully
 *       404:
 *         description: Audit log not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await sequelize.transaction();

    try {
      const { guildId, id } = req.params;

      if (!id) {
        await transaction.rollback();
        return ResponseHandler.sendValidationFail(res, "Missing ID parameter", [
          "ID parameter is required",
        ]);
      }

      // Find the specific audit log by ID
      const auditLog = await UserAuditLogs.findOne({
        where: { id, guildId },
        transaction,
      });

      if (!auditLog) {
        await transaction.rollback();
        return ResponseHandler.sendError(
          res,
          "Audit log not found",
          ResponseCode.NOT_FOUND
        );
      }

      // Delete only this specific audit log
      await auditLog.destroy({ transaction });

      await transaction.commit();

      // Return success with the deleted ID
      ResponseHandler.sendSuccess(
        res,
        { id },
        "User audit log deleted successfully"
      );
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
);

export default router;
