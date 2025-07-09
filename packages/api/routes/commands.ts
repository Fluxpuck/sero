import { Request, Response, Router, NextFunction } from "express";
import { Commands } from "../models";
import { ResponseHandler } from "../utils/response.utils";
import { ResponseCode } from "../utils/response.types";

const router = Router();

/**
 * @swagger
 * /commands:
 *   get:
 *     summary: Get all commands
 *     tags:
 *       - Commands
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
 *                     $ref: '#/components/schemas/Commands'
 *       500:
 *         description: Server error
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const commands = await Commands.findAll();

    ResponseHandler.sendSuccess(
      res,
      commands,
      "Commands retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /commands/{commandId}:
 *   get:
 *     summary: Get a specific command by ID
 *     tags:
 *       - Commands
 *     parameters:
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
 *                   $ref: '#/components/schemas/Commands'
 *       404:
 *         description: Command not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:commandId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { commandId } = req.params;

      const command = await Commands.findOne({
        where: { commandId },
      });

      if (!command) {
        return ResponseHandler.sendError(
          res,
          "Command not found",
          ResponseCode.NOT_FOUND
        );
      }

      ResponseHandler.sendSuccess(
        res,
        command,
        "Command retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /commands:
 *   post:
 *     summary: Create or update a command
 *     tags:
 *       - Commands
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               commandId:
 *                 type: string
 *                 description: Unique identifier for the command
 *               name:
 *                 type: string
 *                 description: Name of the command
 *               description:
 *                 type: string
 *                 description: Description of the command
 *               usage:
 *                 type: string
 *                 description: Usage instructions for the command
 *               interactionType:
 *                 type: string
 *                 description: Type of interaction for the command
 *               interactionOptions:
 *                 type: array
 *                 description: Options for the command interaction
 *               defaultMemberPermissions:
 *                 type: string
 *                 description: Default permissions required to use the command
 *               cooldown:
 *                 type: integer
 *                 description: Cooldown period for the command in seconds
 *     responses:
 *       200:
 *         description: Command updated successfully
 *       201:
 *         description: Command created successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  const transaction = await Commands.sequelize!.transaction();

  try {
    const {
      commandId,
      name,
      description,
      usage,
      interactionType,
      interactionOptions,
      defaultMemberPermissions,
      cooldown,
    } = req.body;

    // Validate required fields
    if (!commandId || !name || !description || !usage || !interactionType) {
      return ResponseHandler.sendValidationFail(
        res,
        "Missing required fields",
        [
          "commandId, name, description, usage, and interactionType are required fields",
        ]
      );
    }

    // Prepare command data for upsert
    const commandData = {
      commandId,
      name,
      description,
      usage,
      interactionType,
      interactionOptions: interactionOptions || null,
      defaultMemberPermissions: defaultMemberPermissions || null,
      cooldown: cooldown || null,
    } as Commands;

    // Use upsert to create or update in a single operation
    const [command, created] = await Commands.upsert(commandData);

    await transaction.commit();

    ResponseHandler.sendSuccess(
      res,
      command,
      created ? "Command created successfully" : "Command updated successfully",
      created ? ResponseCode.CREATED : ResponseCode.SUCCESS
    );
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
});

export default router;
