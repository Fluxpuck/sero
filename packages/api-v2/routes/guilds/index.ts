import { Request, Response, Router, NextFunction } from 'express';
import { Guild, User } from '../../models';

const router = Router();

/**
 * GET /guilds - Retrieve all guilds
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = (page - 1) * limit;
        
        const { count, rows: guilds } = await Guild.findAndCountAll({
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });
        
        res.status(200).json({
            success: true,
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
            data: guilds
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /guilds/:guildId - Retrieve a specific guild
 */
router.get('/:guildId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { guildId } = req.params;
        
        const guild = await Guild.findOne({
            where: { guildId }
        });
        
        if (!guild) {
            const error: any = new Error('Guild not found');
            error.statusCode = 404;
            return next(error);
        }
        
        res.status(200).json({
            success: true,
            data: guild
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /guilds/:guildId/users - Retrieve all users in a guild
 */
router.get('/:guildId/users', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { guildId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = (page - 1) * limit;
        
        // First verify guild exists
        const guild = await Guild.findOne({ where: { guildId } });
        
        if (!guild) {
            const error: any = new Error('Guild not found');
            error.statusCode = 404;
            return next(error);
        }
        
        const { count, rows: users } = await User.findAndCountAll({
            where: { guildId },
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });
        
        res.status(200).json({
            success: true,
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
            data: users
        });
    } catch (error) {
        next(error);
    }
});

export default router;