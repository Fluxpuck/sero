import { Request, Response, Router, NextFunction } from 'express';
import { UserLevel, User, Guild } from '../../models';

const router = Router();

/**
 * GET /levels - Retrieve all user levels
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
        
        const { count, rows: levels } = await UserLevel.findAndCountAll({
            where,
            limit,
            offset,
            order: [['rank', 'ASC']],
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
            data: levels
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /levels/top/:guildId - Get top users by level for a guild
 */
router.get('/top/:guildId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { guildId } = req.params;
        const limit = parseInt(req.query.limit as string) || 10;
        
        // Verify guild exists
        const guild = await Guild.findOne({ where: { guildId } });
        
        if (!guild) {
            const error: any = new Error('Guild not found');
            error.statusCode = 404;
            return next(error);
        }
        
        const topUsers = await UserLevel.findAll({
            where: { guildId },
            limit,
            order: [['level', 'DESC'], ['experience', 'DESC']],
            include: [
                { model: User, as: 'user', attributes: ['userId', 'username', 'premium'] }
            ]
        });
        
        res.status(200).json({
            success: true,
            data: topUsers
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /levels/:userId/:guildId - Get level for a specific user in a guild
 */
router.get('/:userId/:guildId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, guildId } = req.params;
        
        const userLevel = await UserLevel.findOne({
            where: { userId, guildId },
            include: [{ model: User, as: 'user' }]
        });
        
        if (!userLevel) {
            const error: any = new Error('User level not found');
            error.statusCode = 404;
            return next(error);
        }
        
        res.status(200).json({
            success: true,
            data: userLevel
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /levels - Create or update a user's level
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, guildId, experience, level } = req.body;
        
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
        
        // Find or create the user level
        const [userLevel, created] = await UserLevel.findOrCreate({
            where: { userId, guildId },
            defaults: {
                experience: experience || 0,
                level: level || 0
            }
        });
        
        // If not created, update the values
        if (!created && (experience !== undefined || level !== undefined)) {
            await userLevel.update({
                experience: experience !== undefined ? experience : userLevel.experience,
                level: level !== undefined ? level : userLevel.level
            });
        }
        
        res.status(created ? 201 : 200).json({
            success: true,
            data: userLevel
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /levels/:userId/:guildId/addxp - Add experience to a user
 */
router.put('/:userId/:guildId/addxp', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, guildId } = req.params;
        const { amount } = req.body;
        
        if (!amount || isNaN(amount)) {
            const error: any = new Error('Valid amount is required');
            error.statusCode = 400;
            return next(error);
        }
        
        // Find the user level
        let userLevel = await UserLevel.findOne({
            where: { userId, guildId }
        });
        
        if (!userLevel) {
            // If user level doesn't exist, check if user exists
            const user = await User.findOne({
                where: { userId, guildId }
            });
            
            if (!user) {
                const error: any = new Error('User not found');
                error.statusCode = 404;
                return next(error);
            }
            
            // Create a new user level
            userLevel = await UserLevel.create({
                userId,
                guildId,
                experience: amount,
                level: 0
            });
        } else {
            // Update the existing user level
            await userLevel.update({
                experience: userLevel.experience + parseInt(amount)
            });
        }
        
        res.status(200).json({
            success: true,
            data: userLevel
        });
    } catch (error) {
        next(error);
    }
});

export default router;