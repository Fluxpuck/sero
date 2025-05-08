import { Request, Response, Router, NextFunction } from 'express';
import { Aways, User, Guild } from '../../models';

const router = Router();

/**
 * GET /away - Get all away statuses
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = (page - 1) * limit;
        
        // Add filtering options
        const where: any = {};
        if (req.query.guildId) {
            where.guildId = req.query.guildId;
        }
        if (req.query.userId) {
            where.userId = req.query.userId;
        }
        
        const { count, rows: aways } = await Aways.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            include: req.query.include === 'all' ? [
                { model: User, as: 'user' },
                { model: Guild, as: 'guild' }
            ] : []
        });
        
        res.status(200).json({
            success: true,
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
            data: aways
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /away/:userId/:guildId - Get away status for a specific user
 */
router.get('/:userId/:guildId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, guildId } = req.params;
        
        const away = await Aways.findOne({
            where: { userId, guildId },
            include: [{ model: User, as: 'user' }]
        });
        
        if (!away) {
            const error: any = new Error('Away status not found');
            error.statusCode = 404;
            return next(error);
        }
        
        res.status(200).json({
            success: true,
            data: away
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /away - Set a user as away
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, guildId, message, duration } = req.body;
        
        if (!userId || !guildId) {
            const error: any = new Error('UserId and GuildId are required');
            error.statusCode = 400;
            return next(error);
        }
        
        // Check if user exists
        const user = await User.findOne({
            where: { userId, guildId }
        });
        
        if (!user) {
            const error: any = new Error('User not found');
            error.statusCode = 404;
            return next(error);
        }
        
        // Calculate expiration date if duration is provided
        let expireAt = null;
        if (duration) {
            expireAt = new Date();
            expireAt.setMinutes(expireAt.getMinutes() + parseInt(duration));
        }
        
        // Check if user is already away
        const existingAway = await Aways.findOne({
            where: { userId, guildId }
        });
        
        if (existingAway) {
            await existingAway.update({
                message: message || existingAway.message,
                duration: duration !== undefined ? duration : existingAway.duration,
                expireAt: expireAt || existingAway.expireAt
            });
            
            return res.status(200).json({
                success: true,
                data: existingAway
            });
        }
        
        // Create new away status
        const away = await Aways.create({
            userId,
            guildId,
            message: message || 'Away',
            duration,
            expireAt
        });
        
        res.status(201).json({
            success: true,
            data: away
        });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /away/:userId/:guildId - Remove away status
 */
router.delete('/:userId/:guildId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, guildId } = req.params;
        
        const away = await Aways.findOne({
            where: { userId, guildId }
        });
        
        if (!away) {
            const error: any = new Error('Away status not found');
            error.statusCode = 404;
            return next(error);
        }
        
        await away.destroy();
        
        res.status(200).json({
            success: true,
            message: 'Away status removed successfully'
        });
    } catch (error) {
        next(error);
    }
});

export default router;