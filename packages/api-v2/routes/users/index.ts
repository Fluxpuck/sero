import { Request, Response, Router, NextFunction } from 'express';
import { User, Guild, UserLevel, UserBalances, UserBirthdays } from '../../models';

const router = Router();

/**
 * GET /users - Retrieve all users
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = (page - 1) * limit;

        // Add filtering by guildId if provided
        const where: any = {};
        if (req.query.guildId) {
            where.guildId = req.query.guildId;
        }

        const { count, rows: users } = await User.findAndCountAll({
            where,
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

/**
 * GET /users/:userId - Retrieve a specific user
 */
router.get('/:userId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const guildId = req.query.guildId as string;

        // Build query for finding the user
        const query: any = { userId };
        if (guildId) {
            query.guildId = guildId;
        }

        const user = await User.findOne({
            where: query,
            include: req.query.include === 'all' ? [
                { model: UserLevel, as: 'level' },
                { model: UserBalances, as: 'balance' },
                { model: UserBirthdays, as: 'birthday' },
                { model: Guild, as: 'guild' }
            ] : []
        });

        if (!user) {
            const error: any = new Error('User not found');
            error.statusCode = 404;
            return next(error);
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /users - Create a new user
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, guildId, username, premium, userType } = req.body;

        if (!userId || !guildId || !username) {
            const error: any = new Error('UserId, GuildId and Username are required');
            error.statusCode = 400;
            return next(error);
        }

        // Check if user already exists in this guild
        const existingUser = await User.findOne({
            where: { userId, guildId }
        });

        if (existingUser) {
            const error: any = new Error('User already exists in this guild');
            error.statusCode = 409;
            return next(error);
        }

        // Check if guild exists
        const guild = await Guild.findOne({
            where: { guildId }
        });

        if (!guild) {
            const error: any = new Error('Guild not found');
            error.statusCode = 404;
            return next(error);
        }

        const user = await User.create({
            userId,
            guildId,
            username,
            premium: premium || false,
            userType
        });

        res.status(201).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /users/:userId - Update a user
 */
router.put('/:userId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.params;
        const guildId = req.query.guildId as string;
        const { username, premium, userType } = req.body;

        if (!guildId) {
            const error: any = new Error('GuildId is required as a query parameter');
            error.statusCode = 400;
            return next(error);
        }

        const user = await User.findOne({
            where: { userId, guildId }
        });

        if (!user) {
            const error: any = new Error('User not found');
            error.statusCode = 404;
            return next(error);
        }

        await user.update({
            username: username || user.username,
            premium: premium !== undefined ? premium : user.premium,
            userType: userType || user.userType
        });

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
});

export default router;