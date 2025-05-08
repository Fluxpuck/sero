import { Request, Response, Router, NextFunction } from 'express';
import { Modifiers, User, Guild } from '../../models';

const router = Router();

/**
 * GET /modifiers - Get all modifiers
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
        if (req.query.active === 'true') {
            where.active = true;
        } else if (req.query.active === 'false') {
            where.active = false;
        }
        
        const { count, rows: modifiers } = await Modifiers.findAndCountAll({
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
            data: modifiers
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /modifiers/:id - Get modifier by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        
        const modifier = await Modifiers.findByPk(id, {
            include: [
                { model: User, as: 'user' },
                { model: Guild, as: 'guild' }
            ]
        });
        
        if (!modifier) {
            const error: any = new Error('Modifier not found');
            error.statusCode = 404;
            return next(error);
        }
        
        res.status(200).json({
            success: true,
            data: modifier
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /modifiers/guild/:guildId - Get all modifiers for a guild
 */
router.get('/guild/:guildId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { guildId } = req.params;
        const active = req.query.active === 'true' ? true : (req.query.active === 'false' ? false : undefined);
        
        // Verify guild exists
        const guild = await Guild.findOne({ where: { guildId } });
        
        if (!guild) {
            const error: any = new Error('Guild not found');
            error.statusCode = 404;
            return next(error);
        }
        
        const where: any = { guildId, userId: null };
        if (active !== undefined) {
            where.active = active;
        }
        
        const modifiers = await Modifiers.findAll({
            where,
            order: [['amount', 'DESC']]
        });
        
        res.status(200).json({
            success: true,
            data: modifiers
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /modifiers/user/:userId/:guildId - Get modifiers for a specific user
 */
router.get('/user/:userId/:guildId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, guildId } = req.params;
        const active = req.query.active === 'true' ? true : (req.query.active === 'false' ? false : undefined);
        
        // Verify user exists
        const user = await User.findOne({ where: { userId, guildId } });
        
        if (!user) {
            const error: any = new Error('User not found');
            error.statusCode = 404;
            return next(error);
        }
        
        // Get user-specific modifiers
        const where: any = { userId, guildId };
        if (active !== undefined) {
            where.active = active;
        }
        
        const userModifiers = await Modifiers.findAll({
            where,
            order: [['amount', 'DESC']]
        });
        
        // Get guild-wide modifiers that also apply to this user
        const guildWhere: any = { guildId, userId: null };
        if (active !== undefined) {
            guildWhere.active = active;
        }
        
        const guildModifiers = await Modifiers.findAll({
            where: guildWhere,
            order: [['amount', 'DESC']]
        });
        
        // Combine both sets of modifiers
        const allModifiers = [...userModifiers, ...guildModifiers];
        
        res.status(200).json({
            success: true,
            data: allModifiers
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /modifiers - Create a new modifier
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { guildId, userId, amount, active, expireAt } = req.body;
        
        if (!guildId || !amount) {
            const error: any = new Error('GuildId and amount are required');
            error.statusCode = 400;
            return next(error);
        }
        
        if (amount < 1 || amount > 10) {
            const error: any = new Error('Amount must be between 1 and 10');
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
        
        // If userId is provided, check if user exists
        if (userId) {
            const user = await User.findOne({ where: { userId, guildId } });
            
            if (!user) {
                const error: any = new Error('User not found');
                error.statusCode = 404;
                return next(error);
            }
        }
        
        // Create new modifier
        const modifier = await Modifiers.create({
            guildId,
            userId,
            amount,
            active: active !== undefined ? active : true,
            expireAt
        });
        
        res.status(201).json({
            success: true,
            data: modifier
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /modifiers/:id - Update a modifier
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { amount, active, expireAt } = req.body;
        
        const modifier = await Modifiers.findByPk(id);
        
        if (!modifier) {
            const error: any = new Error('Modifier not found');
            error.statusCode = 404;
            return next(error);
        }
        
        if (amount !== undefined && (amount < 1 || amount > 10)) {
            const error: any = new Error('Amount must be between 1 and 10');
            error.statusCode = 400;
            return next(error);
        }
        
        await modifier.update({
            amount: amount !== undefined ? amount : modifier.amount,
            active: active !== undefined ? active : modifier.active,
            expireAt: expireAt !== undefined ? expireAt : modifier.expireAt
        });
        
        res.status(200).json({
            success: true,
            data: modifier
        });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /modifiers/:id - Delete a modifier
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        
        const modifier = await Modifiers.findByPk(id);
        
        if (!modifier) {
            const error: any = new Error('Modifier not found');
            error.statusCode = 404;
            return next(error);
        }
        
        await modifier.destroy();
        
        res.status(200).json({
            success: true,
            message: 'Modifier deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

export default router;