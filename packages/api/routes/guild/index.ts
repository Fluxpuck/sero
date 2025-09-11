import { Request, Response, Router, NextFunction } from "express";
import { Guild, GuildSettings } from "../../models";
import { ResponseHandler } from "../../utils/response.utils";
import { ResponseCode } from "../../utils/response.types";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /guild/{guildId}:
 *   get:
 *     summary: Get a specific guild by guildId
 *     tags:
 *       - Guild
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: The Discord ID of the guild to retrieve
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
 *                   $ref: '#/components/schemas/Guild'
 *       404:
 *         description: Guild not found
 *       500:
 *         description: Server error
 */
router.get(
  "/:guildId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { guildId } = req.params;
      const { settings = false } = req.query;

      const guild = await Guild.findOne({
        where: { guildId },
        include: settings === "true" ? [GuildSettings] : [],
      });

      if (!guild) {
        return ResponseHandler.sendError(
          res,
          "Guild not found",
          ResponseCode.NOT_FOUND
        );
      }

      ResponseHandler.sendSuccess(res, guild, "Guild retrieved successfully");
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

/**
 * @swagger
 * /guild:
 *   post:
 *     summary: Create or update a guild
 *     tags:
 *       - Guild
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - guildId
 *               - guildName
 *             properties:
 *               guildId:
 *                 type: string
 *                 description: Discord guild ID
 *               guildName:
 *                 type: string
 *                 description: Name of the guild
 *               premium:
 *                 type: boolean
 *                 description: Premium status of the guild
 *                 default: false
 *     responses:
 *       200:
 *         description: Guild updated successfully
 *       201:
 *         description: Guild created successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { guildId, guildName, premium } = req.body;

    // Validate required fields
    if (!guildId || !guildName) {
      return ResponseHandler.sendValidationFail(
        res,
        "Guild ID and Guild Name are required",
        ["guildId and guildName are required fields"]
      );
    }

    // Check if guild exists to determine if this is create or update
    const existingGuild = await Guild.findOne({
      where: { guildId },
    });

    // Prepare guild data
    const guildData = {
      guildId,
      guildName,
      premium:
        premium !== undefined ? premium : existingGuild?.premium || false,
    } as Guild;

    // Use upsert to create or update
    const [guild, created] = await Guild.upsert(guildData);

    // Send appropriate response based on whether guild was created or updated
    if (created) {
      ResponseHandler.sendSuccess(
        res,
        guild,
        "Guild created successfully",
        ResponseCode.CREATED
      );
    } else {
      ResponseHandler.sendSuccess(res, guild, "Guild updated successfully");
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /guild/{guildId}:
 *   delete:
 *     summary: Soft delete a guild
 *     tags:
 *       - Guilds
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Guild deleted successfully
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
 *       404:
 *         description: Guild not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:guildId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { guildId } = req.params;

      const deleted = await Guild.destroy({
        where: {
          guildId,
        },
      });

      if (deleted === 0) {
        return ResponseHandler.sendError(
          res,
          "Guild not found for this guild",
          ResponseCode.NOT_FOUND
        );
      }

      ResponseHandler.sendSuccess(res, null, "Guild deleted successfully");
    } catch (error) {
      next(error);
    }
  }
);

export default router;
