import { Request, Response, Router, NextFunction } from 'express';
import { GuildSettings, GuildSettingType } from '../../../../models/guild-settings.model';
import { ResponseHandler } from '../../../../utils/response.utils';
import { ResponseCode } from '../../../../utils/response.types';

const router = Router();

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
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { guildId } = req.params;
        const { type, targetId, excludeIds } = req.body;

        if (!type || !targetId) {
            return ResponseHandler.sendValidationFail(
                res,
                'Type and targetId are required',
                ['Type and targetId are required fields']
            );
        }

        // Validate the setting type
        if (!Object.values(GuildSettingType).includes(type as GuildSettingType)) {
            return ResponseHandler.sendValidationFail(
                res,
                'Invalid setting type',
                [`'${type}' is not a valid setting type`]
            );
        }


        // Try to find existing setting first
        const [setting, created] = await GuildSettings.findOrCreate({
            where: { 
                guildId,
                type: type as GuildSettingType
            },
            defaults: {
                guildId,
                type: type as GuildSettingType,
                targetId,
                excludeIds: excludeIds || []
            } as any // Type assertion needed due to Sequelize type definitions
        });

        // If setting already exists, update it
        if (!created) {
            setting.targetId = targetId;
            if (excludeIds) {
                setting.excludeIds = excludeIds;
            }
            await setting.save();
            return ResponseHandler.sendSuccess(res, setting, 'Guild setting updated successfully');
        }

        ResponseHandler.sendSuccess(res, setting, 'Guild setting created successfully', ResponseCode.CREATED);
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /guild/{guildId}/settings/{settingId}:
 *   patch:
 *     summary: Update a guild setting
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
 *         description: The ID of the setting to update
 *         schema:
 *           type: integer
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
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Setting not found
 *       500:
 *         description: Server error
 */
router.patch('/:settingId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { guildId, settingId } = req.params;
        const { type, targetId, excludeIds } = req.body;

        if (!type || !targetId) {
            return ResponseHandler.sendValidationFail(
                res,
                'Type and targetId are required',
                ['Type and targetId are required fields']
            );
        }

        // Validate the setting type
        if (!Object.values(GuildSettingType).includes(type as GuildSettingType)) {
            return ResponseHandler.sendValidationFail(
                res,
                'Invalid setting type',
                [`'${type}' is not a valid setting type`]
            );
        }

        const settingToUpdate = await GuildSettings.findByPk(settingId, {
            where: { guildId }
        });

        if (!settingToUpdate) {
            return ResponseHandler.sendError(
                res,
                'Setting not found for this guild',
                ResponseCode.NOT_FOUND
            );
        }

        const updateData: any = {
            type: type as GuildSettingType,
            targetId
        };
        
        if (excludeIds) {
            updateData.excludeIds = excludeIds;
        }

        await settingToUpdate.update(updateData);
        ResponseHandler.sendSuccess(res, settingToUpdate, 'Guild setting updated successfully');
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
router.delete('/:settingId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { guildId, settingId } = req.params;
        
        const setting = await GuildSettings.findOne({
            where: { id: settingId, guildId }
        });

        if (!setting) {
            return ResponseHandler.sendError(
                res,
                'Setting not found for this guild',
                ResponseCode.NOT_FOUND
            );
        }


        await setting.destroy();
        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router;