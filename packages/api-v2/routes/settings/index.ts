import { Request, Response, Router, NextFunction } from 'express';
import { GuildSettings, Guild } from '../../models';

const router = Router();

/**
 * GET /settings/:guildId - Get all settings for a guild
 */
router.get('/:guildId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { guildId } = req.params;
        
        // Verify guild exists
        const guild = await Guild.findOne({ where: { guildId } });
        
        if (!guild) {
            const error: any = new Error('Guild not found');
            error.statusCode = 404;
            return next(error);
        }
        
        const settings = await GuildSettings.findAll({
            where: { guildId },
            order: [['key', 'ASC']]
        });
        
        // Transform into key-value object if requested
        if (req.query.format === 'object') {
            const settingsObject: { [key: string]: any } = {};
            settings.forEach(setting => {
                settingsObject[setting.dataValues.key] = setting.dataValues.value;
            });
            
            return res.status(200).json({
                success: true,
                data: settingsObject
            });
        }
        
        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /settings/:guildId/:key - Get a specific setting
 */
router.get('/:guildId/:key', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { guildId, key } = req.params;
        
        const setting = await GuildSettings.findOne({
            where: { guildId, key }
        });
        
        if (!setting) {
            const error: any = new Error('Setting not found');
            error.statusCode = 404;
            return next(error);
        }
        
        res.status(200).json({
            success: true,
            data: setting
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /settings/:guildId - Create or update a setting
 */
router.post('/:guildId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { guildId } = req.params;
        const { key, value, description } = req.body;
        
        if (!key || value === undefined) {
            const error: any = new Error('Key and value are required');
            error.statusCode = 400;
            return next(error);
        }
        
        // Verify guild exists
        const guild = await Guild.findOne({ where: { guildId } });
        
        if (!guild) {
            const error: any = new Error('Guild not found');
            error.statusCode = 404;
            return next(error);
        }
        
        // Find or create the setting
        const [setting, created] = await GuildSettings.findOrCreate({
            where: { guildId, key },
            defaults: {
                value: JSON.stringify(value),
                description: description || null
            }
        });
        
        // If not created, update the value
        if (!created) {
            await setting.update({
                value: JSON.stringify(value),
                description: description !== undefined ? description : setting.description
            });
        }
        
        res.status(created ? 201 : 200).json({
            success: true,
            data: setting
        });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /settings/:guildId/:key - Delete a setting
 */
router.delete('/:guildId/:key', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { guildId, key } = req.params;
        
        const setting = await GuildSettings.findOne({
            where: { guildId, key }
        });
        
        if (!setting) {
            const error: any = new Error('Setting not found');
            error.statusCode = 404;
            return next(error);
        }
        
        await setting.destroy();
        
        res.status(200).json({
            success: true,
            message: 'Setting deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /settings/:guildId/bulk - Create or update multiple settings at once
 */
router.post('/:guildId/bulk', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { guildId } = req.params;
        const { settings } = req.body;
        
        if (!settings || !Array.isArray(settings)) {
            const error: any = new Error('Settings array is required');
            error.statusCode = 400;
            return next(error);
        }
        
        // Verify guild exists
        const guild = await Guild.findOne({ where: { guildId } });
        
        if (!guild) {
            const error: any = new Error('Guild not found');
            error.statusCode = 404;
            return next(error);
        }
        
        const results = [];
        
        // Process each setting
        for (const item of settings) {
            if (!item.key || item.value === undefined) {
                continue;
            }
            
            const [setting, created] = await GuildSettings.findOrCreate({
                where: { guildId, key: item.key },
                defaults: {
                    value: JSON.stringify(item.value),
                    description: item.description || null
                }
            });
            
            if (!created) {
                await setting.update({
                    value: JSON.stringify(item.value),
                    description: item.description !== undefined ? item.description : setting.description
                });
            }
            
            results.push(setting);
        }
        
        res.status(200).json({
            success: true,
            data: results
        });
    } catch (error) {
        next(error);
    }
});

export default router;