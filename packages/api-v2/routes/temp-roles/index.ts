import { Request, Response, Router, NextFunction } from 'express';
import { TemporaryRole, User, Guild } from '../../models';

const router = Router();

/**
 * GET /temp-roles - Get all temporary roles
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
        if (req.query.roleId) {
            where.roleId = req.query.roleId;
        }
        
        const { count, rows: tempRoles } = await TemporaryRole.findAndCountAll({
            where,
            limit,
            offset,
            order: [['expireAt', 'ASC']],
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
            data: tempRoles
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /temp-roles/:id - Get a specific temporary role by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        
        const tempRole = await TemporaryRole.findByPk(id, {
            include: [
                { model: User, as: 'user' },
                { model: Guild, as: 'guild' }
            ]
        });
        
        if (!tempRole) {
            const error: any = new Error('Temporary role not found');
            error.statusCode = 404;
            return next(error);
        }
        
        res.status(200).json({
            success: true,
            data: tempRole
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /temp-roles/user/:userId/:guildId - Get all temporary roles for a specific user
 */
router.get('/user/:userId/:guildId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, guildId } = req.params;
        
        const tempRoles = await TemporaryRole.findAll({
            where: { userId, guildId },
            order: [['expireAt', 'ASC']]
        });
        
        res.status(200).json({
            success: true,
            data: tempRoles
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /temp-roles - Create a new temporary role
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, guildId, roleId, duration } = req.body;
        
        if (!userId || !guildId || !roleId) {
            const error: any = new Error('UserId, GuildId, and RoleId are required');
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
        
        // Check if the temporary role already exists
        const existingTempRole = await TemporaryRole.findOne({
            where: { userId, guildId, roleId }
        });
        
        if (existingTempRole) {
            await existingTempRole.update({
                duration: duration !== undefined ? duration : existingTempRole.duration,
                expireAt: expireAt || existingTempRole.expireAt
            });
            
            return res.status(200).json({
                success: true,
                data: existingTempRole
            });
        }
        
        // Create new temporary role
        const tempRole = await TemporaryRole.create({
            userId,
            guildId,
            roleId,
            duration,
            expireAt
        });
        
        res.status(201).json({
            success: true,
            data: tempRole
        });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /temp-roles/:id - Remove a temporary role
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        
        const tempRole = await TemporaryRole.findByPk(id);
        
        if (!tempRole) {
            const error: any = new Error('Temporary role not found');
            error.statusCode = 404;
            return next(error);
        }
        
        await tempRole.destroy();
        
        res.status(200).json({
            success: true,
            message: 'Temporary role removed successfully'
        });
    } catch (error) {
        next(error);
    }
});

export default router;