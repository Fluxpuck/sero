import { Request, Response, Router, NextFunction } from "express";
import { TemporaryRole } from "../../../../models";
import { ResponseHandler } from "../../../../utils/response.utils";
import { sequelize } from "../../../../database/sequelize";
import { ResponseCode } from "../../../../utils/response.types";
import { Op } from "sequelize";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /guild/{guildId}/temp-role:
 *   get:
 *     summary: Get all temporary roles for a guild
 *     tags:
 *       - Temporary Roles
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
 *                     $ref: '#/components/schemas/TemporaryRole'
 *       500:
 *         description: Server error
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { guildId } = req.params;

    const tempRoles = await TemporaryRole.findAll({
      where: { guildId },
    });

    ResponseHandler.sendSuccess(
      res,
      tempRoles,
      "Temporary roles retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /guild/{guildId}/temp-role/active:
 *   get:
 *     summary: Get all active temporary roles for a guild (not expired)
 *     tags:
 *       - Temporary Roles
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
 *       500:
 *         description: Server error
 */
router.get(
  "/active",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { guildId } = req.params;

      const tempRoles = await TemporaryRole.findAll({
        where: {
          guildId,
          [Op.or]: [{ expireAt: { [Op.gt]: new Date() } }, { expireAt: null }],
        },
      });

      ResponseHandler.sendSuccess(
        res,
        tempRoles,
        "Active temporary roles retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /guild/{guildId}/temp-role/expired:
 *   get:
 *     summary: Get all expired temporary roles for a guild
 *     tags:
 *       - Temporary Roles
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
 *       500:
 *         description: Server error
 */
router.get(
  "/expired",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { guildId } = req.params;

      const tempRoles = await TemporaryRole.findAll({
        where: {
          guildId,
          expireAt: { [Op.lt]: new Date() },
        },
      });

      ResponseHandler.sendSuccess(
        res,
        tempRoles,
        "Expired temporary roles retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /guild/{guildId}/temp-role/user/{userId}:
 *   get:
 *     summary: Get all temporary roles for a specific user in a guild
 *     tags:
 *       - Temporary Roles
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
 *       500:
 *         description: Server error
 */
router.get(
  "/user/:userId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { guildId, userId } = req.params;

      const tempRoles = await TemporaryRole.findAll({
        where: {
          guildId,
          userId,
        },
      });

      ResponseHandler.sendSuccess(
        res,
        tempRoles,
        "User's temporary roles retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /guild/{guildId}/temp-role/{id}:
 *   get:
 *     summary: Get a specific temporary role by ID
 *     tags:
 *       - Temporary Roles
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the temporary role
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successful operation
 *       404:
 *         description: Temporary role not found
 *       500:
 *         description: Server error
 */
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { guildId, id } = req.params;

    const tempRole = await TemporaryRole.findOne({
      where: {
        id: parseInt(id),
        guildId,
      },
    });

    if (!tempRole) {
      return ResponseHandler.sendError(
        res,
        "Temporary role not found",
        ResponseCode.NOT_FOUND
      );
    }

    ResponseHandler.sendSuccess(
      res,
      tempRole,
      "Temporary role retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /guild/{guildId}/temp-role:
 *   post:
 *     summary: Create a new temporary role
 *     tags:
 *       - Temporary Roles
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
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The Discord ID of the user
 *               roleId:
 *                 type: string
 *                 description: The Discord ID of the role
 *               duration:
 *                 type: integer
 *                 description: Duration in minutes (optional)
 *     responses:
 *       201:
 *         description: Temporary role created successfully
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
      const { roleId, duration = 604800 } = req.body; // 1 week in seconds

      // Validate required fields
      if (!userId || !roleId) {
        await transaction.rollback();
        return ResponseHandler.sendValidationFail(
          res,
          "Missing required fields",
          ["userId and roleId are required fields"]
        );
      }

      // Validate duration if provided
      if (duration !== undefined && duration !== null) {
        if (typeof duration !== "number" || duration < 0) {
          await transaction.rollback();
          return ResponseHandler.sendValidationFail(res, "Invalid duration", [
            "Duration must be a positive number",
          ]);
        }
      }

      // Prepare temp role data for upsert
      const tempRoleData = {
        guildId,
        userId,
        roleId,
        duration: duration || null,
      } as TemporaryRole;

      // Use upsert to create or update in a single operation
      const [tempRole] = await TemporaryRole.upsert(tempRoleData, {
        transaction,
      });

      await transaction.commit();

      ResponseHandler.sendSuccess(
        res,
        tempRole,
        "Temporary role created successfully",
        ResponseCode.CREATED
      );
    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  }
);

/**
 * @swagger
 * /guild/{guildId}/temp-role/{id}:
 *   delete:
 *     summary: Delete a temporary role
 *     tags:
 *       - Temporary Roles
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the temporary role
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Temporary role deleted successfully
 *       404:
 *         description: Temporary role not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { guildId, id } = req.params;

      const deleted = await TemporaryRole.destroy({
        where: {
          id: parseInt(id),
          guildId,
        },
      });

      if (deleted === 0) {
        return ResponseHandler.sendError(
          res,
          "Temporary role not found",
          ResponseCode.NOT_FOUND
        );
      }

      ResponseHandler.sendSuccess(
        res,
        null,
        "Temporary role deleted successfully",
        ResponseCode.NO_CONTENT
      );
    } catch (error) {
      next(error);
    }
  }
);

export default router;
