import { Request, Response, Router, NextFunction } from "express";
import {
  GuildSettings,
  GuildSettingType,
} from "../../../../models/guild-settings.model";
import { ResponseHandler } from "../../../../utils/response.utils";
import { ResponseCode } from "../../../../utils/response.types";
import { sequelize } from "../../../../database/sequelize";
import { cache } from "../../../../middleware/cache";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /guild/{guildId}/settings:
 *   get:
 *     summary: Get the guild settings for a guild
 *     tags: [Guild Settings]
 *     parameters:
 *       - in: path
 *         name: guildId
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *       - in: query
 *         name: type
 *         description: The type of the guild setting
 *         schema:
 *           type: string
 *         enum: [admin-role, moderator-role, welcome-channel, level-up-channel, exp-reward-drop-channel]
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GuildSettings'
 *       404:
 *         description: No settings found for this guild
 *       500:
 *         description: Server error
 */
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { guildId } = req.params;
    const { type } = req.query;

    const options: any = { where: { guildId } };

    if (type) {
      options.where.type = type as GuildSettingType;
    }

    const settings = await GuildSettings.findAll(options);

    if (!settings.length) {
      return ResponseHandler.sendError(
        res,
        "No settings found for this guild",
        ResponseCode.NOT_FOUND
      );
    }

    ResponseHandler.sendSuccess(
      res,
      settings,
      "Guild settings retrieved successfully"
    );
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /guild/{guildId}/settings:
 *   post:
 *     summary: Create or update a guild setting
 *     tags: [Guild Settings]
 *     parameters:
 *       - in: path
 *         name: guildId
 *         schema:
 *           type: string
 *         required: true
 *         description: The guild ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - targetId
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [admin-role, moderator-role, welcome-channel, level-up-channel, exp-reward-drop-channel, birthday-role, birthday-message-channel, member-logs-channel, ban-logs-channel, vc-logs-channel]
 *                 description: The type of setting to update
 *               targetId:
 *                 type: string
 *                 description: The target ID (e.g., role ID or channel ID) for this setting
 *               excludeIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Optional array of IDs to exclude for this setting
 *     responses:
 *       200:
 *         description: Setting was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GuildSetting'
 *       201:
 *         description: Setting was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GuildSetting'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    await sequelize.transaction(async (transaction) => {
      const { guildId } = req.params;
      const { type, targetId, excludeIds } = req.body;

      if (!type || !targetId) {
        return ResponseHandler.sendValidationFail(
          res,
          "Type and targetId are required",
          ["Type and targetId are required fields"]
        );
      }

      // Validate the setting type
      if (!Object.values(GuildSettingType).includes(type as GuildSettingType)) {
        return ResponseHandler.sendValidationFail(res, "Invalid setting type", [
          `'${type}' is not a valid setting type`,
        ]);
      }

      // Use upsert to create or update the setting
      const result = await GuildSettings.upsert(
        {
          guildId,
          type: type as GuildSettingType,
          targetId,
          excludeIds: excludeIds || [],
        } as GuildSettings,
        {
          transaction,
          returning: true,
          // These are the fields that identify a unique record
          fields: ['guildId', 'type', 'targetId', 'excludeIds']
        }
      );
      
      // result[0] is the updated/created instance
      // result[1] is a boolean indicating whether a record was created (true) or updated (false)
      const [setting, created] = result;
      
      ResponseHandler.sendSuccess(
        res,
        setting,
        created ? "Guild setting created successfully" : "Guild setting updated successfully",
        created ? ResponseCode.CREATED : ResponseCode.SUCCESS
      );
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /guild/{guildId}/settings/{settingId}:
 *   delete:
 *     summary: Delete a guild setting
 *     tags: [Guild Settings]
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *       - name: settingId
 *         in: path
 *         required: true
 *         description: The ID of the setting to delete
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Setting was successfully deleted
 *       404:
 *         description: Setting not found
 *       500:
 *         description: Server error
 */
router.delete(
  "/:settingId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await sequelize.transaction(async (transaction) => {
        const { guildId, settingId } = req.params;

        const setting = await GuildSettings.findOne({
          where: { id: settingId, guildId },
        });

        if (!setting) {
          return ResponseHandler.sendError(
            res,
            "Setting not found for this guild",
            ResponseCode.NOT_FOUND
          );
        }

        await setting.destroy({ transaction });
        res.status(204).send();
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /guild/{guildId}/settings/available:
 *   get:
 *     summary: Get all available guild setting types
 *     tags: [Guild Settings]
 *     parameters:
 *       - in: path
 *         name: guildId
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
 *                 types:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *       500:
 *         description: Server error
 */
router.get(
  "/available",
  cache({ ttl: 3600 }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Create a descriptive list of all available setting types
      const settingTypes = Object.values(GuildSettingType).map((type) => {
        let name = "";
        let description = "";

        switch (type) {
          // case GuildSettingType.ADMIN_ROLE:
          //   name = "Admin Role";
          //   description =
          //     "Role that has administrative permissions for the bot";
          //   break;
          // case GuildSettingType.MODERATOR_ROLE:
          //   name = "Moderator Role";
          //   description = "Role that has moderation permissions for the bot";
          //   break;
          case GuildSettingType.WELCOME_CHANNEL:
            name = "Welcome Channel";
            description = "Channel where welcome messages are sent";
            break;
          case GuildSettingType.LEVEL_UP_CHANNEL:
            name = "Level Up Channel";
            description = "Channel where level up announcements are sent";
            break;
          case GuildSettingType.EXP_REWARD_DROP_CHANNEL:
            name = "Experience Reward Channel";
            description = "Channel where experience reward drops are announced";
            break;
          case GuildSettingType.BIRTHDAY_ROLE:
            name = "Birthday Role";
            description = "Role assigned to members on their birthday";
            break;
          case GuildSettingType.BIRTHDAY_CHANNEL:
            name = "Birthday Channel";
            description = "Channel where birthday announcements are sent";
            break;
          case GuildSettingType.MEMBER_LOGS_CHANNEL:
            name = "Member Logs Channel";
            description = "Channel where member join/leave events are logged";
            break;
          case GuildSettingType.VC_LOGS_CHANNEL:
            name = "Voice Channel Logs";
            description = "Channel where voice channel events are logged";
            break;
          case GuildSettingType.MODERATION_LOGS_CHANNEL:
            name = "Moderation Logs Channel";
            description = "Channel where moderation events are logged";
            break;
          default:
            name = String(type)
              .replace(/-/g, " ")
              .replace(/\b\w/g, (letter: string) => letter.toUpperCase());
            description = "No description available";
        }

        return {
          id: type,
          name,
          description,
        };
      });

      ResponseHandler.sendSuccess(
        res,
        { types: settingTypes },
        "Available guild setting types retrieved successfully"
      );
    } catch (error) {
      next(error);
    }
  }
);

export default router;
