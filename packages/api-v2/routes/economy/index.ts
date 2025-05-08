import { Request, Response, Router, NextFunction } from 'express';
import { UserBalances, UserEconomyLogs, User, Guild } from '../../models';

const router = Router();

/**
 * GET /economy/balances - Get all user balances
 */
router.get('/balances', async (req: Request, res: Response, next: NextFunction) => {
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
        
        const { count, rows: balances } = await UserBalances.findAndCountAll({
            where,
            limit,
            offset,
            order: [['balance', 'DESC']],
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
            data: balances
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /economy/balances/top/:guildId - Get top users by balance for a guild
 */
router.get('/balances/top/:guildId', async (req: Request, res: Response, next: NextFunction) => {
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
        
        const topUsers = await UserBalances.findAll({
            where: { guildId },
            limit,
            order: [['balance', 'DESC']],
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
 * GET /economy/balances/:userId/:guildId - Get balance for a specific user in a guild
 */
router.get('/balances/:userId/:guildId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, guildId } = req.params;
        
        const userBalance = await UserBalances.findOne({
            where: { userId, guildId },
            include: [{ model: User, as: 'user' }]
        });
        
        if (!userBalance) {
            const error: any = new Error('User balance not found');
            error.statusCode = 404;
            return next(error);
        }
        
        res.status(200).json({
            success: true,
            data: userBalance
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /economy/balances - Create or update a user's balance
 */
router.post('/balances', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, guildId, balance, bank } = req.body;
        
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
        
        // Find or create the user balance
        const [userBalance, created] = await UserBalances.findOrCreate({
            where: { userId, guildId },
            defaults: {
                balance: balance || 0,
                bank: bank || 0
            }
        });
        
        // If not created, update the values
        if (!created && (balance !== undefined || bank !== undefined)) {
            await userBalance.update({
                balance: balance !== undefined ? balance : userBalance.balance,
                bank: bank !== undefined ? bank : userBalance.bank
            });
        }
        
        res.status(created ? 201 : 200).json({
            success: true,
            data: userBalance
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /economy/balances/:userId/:guildId/add - Add currency to a user
 */
router.put('/balances/:userId/:guildId/add', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, guildId } = req.params;
        const { amount, type, reason } = req.body;
        
        if (!amount || isNaN(amount)) {
            const error: any = new Error('Valid amount is required');
            error.statusCode = 400;
            return next(error);
        }
        
        // Find the user balance
        let userBalance = await UserBalances.findOne({
            where: { userId, guildId }
        });
        
        if (!userBalance) {
            // If user balance doesn't exist, check if user exists
            const user = await User.findOne({
                where: { userId, guildId }
            });
            
            if (!user) {
                const error: any = new Error('User not found');
                error.statusCode = 404;
                return next(error);
            }
            
            // Create a new user balance
            userBalance = await UserBalances.create({
                userId,
                guildId,
                balance: type === 'bank' ? 0 : parseInt(amount),
                bank: type === 'bank' ? parseInt(amount) : 0
            });
        } else {
            // Update the existing user balance
            if (type === 'bank') {
                await userBalance.update({
                    bank: userBalance.bank + parseInt(amount)
                });
            } else {
                await userBalance.update({
                    balance: userBalance.balance + parseInt(amount)
                });
            }
        }
        
        // Log the transaction
        await UserEconomyLogs.create({
            userId,
            guildId,
            amount: parseInt(amount),
            type: 'add',
            location: type || 'balance',
            reason: reason || 'API transaction'
        });
        
        res.status(200).json({
            success: true,
            data: userBalance
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /economy/balances/:userId/:guildId/subtract - Subtract currency from a user
 */
router.put('/balances/:userId/:guildId/subtract', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, guildId } = req.params;
        const { amount, type, reason } = req.body;
        
        if (!amount || isNaN(amount)) {
            const error: any = new Error('Valid amount is required');
            error.statusCode = 400;
            return next(error);
        }
        
        // Find the user balance
        const userBalance = await UserBalances.findOne({
            where: { userId, guildId }
        });
        
        if (!userBalance) {
            const error: any = new Error('User balance not found');
            error.statusCode = 404;
            return next(error);
        }
        
        // Make sure they have enough currency
        if (type === 'bank') {
            if (userBalance.bank < parseInt(amount)) {
                const error: any = new Error('Insufficient funds in bank');
                error.statusCode = 400;
                return next(error);
            }
            
            await userBalance.update({
                bank: userBalance.bank - parseInt(amount)
            });
        } else {
            if (userBalance.balance < parseInt(amount)) {
                const error: any = new Error('Insufficient funds in balance');
                error.statusCode = 400;
                return next(error);
            }
            
            await userBalance.update({
                balance: userBalance.balance - parseInt(amount)
            });
        }
        
        // Log the transaction
        await UserEconomyLogs.create({
            userId,
            guildId,
            amount: parseInt(amount),
            type: 'subtract',
            location: type || 'balance',
            reason: reason || 'API transaction'
        });
        
        res.status(200).json({
            success: true,
            data: userBalance
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /economy/balances/:userId/:guildId/transfer - Transfer currency between wallet and bank
 */
router.put('/balances/:userId/:guildId/transfer', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, guildId } = req.params;
        const { amount, from, to, reason } = req.body;
        
        if (!amount || isNaN(amount) || !from || !to) {
            const error: any = new Error('Valid amount, from, and to are required');
            error.statusCode = 400;
            return next(error);
        }
        
        if (from !== 'balance' && from !== 'bank') {
            const error: any = new Error('From must be either "balance" or "bank"');
            error.statusCode = 400;
            return next(error);
        }
        
        if (to !== 'balance' && to !== 'bank') {
            const error: any = new Error('To must be either "balance" or "bank"');
            error.statusCode = 400;
            return next(error);
        }
        
        if (from === to) {
            const error: any = new Error('From and to cannot be the same');
            error.statusCode = 400;
            return next(error);
        }
        
        // Find the user balance
        const userBalance = await UserBalances.findOne({
            where: { userId, guildId }
        });
        
        if (!userBalance) {
            const error: any = new Error('User balance not found');
            error.statusCode = 404;
            return next(error);
        }
        
        // Make sure they have enough currency
        if (from === 'bank') {
            if (userBalance.bank < parseInt(amount)) {
                const error: any = new Error('Insufficient funds in bank');
                error.statusCode = 400;
                return next(error);
            }
            
            await userBalance.update({
                bank: userBalance.bank - parseInt(amount),
                balance: userBalance.balance + parseInt(amount)
            });
        } else {
            if (userBalance.balance < parseInt(amount)) {
                const error: any = new Error('Insufficient funds in balance');
                error.statusCode = 400;
                return next(error);
            }
            
            await userBalance.update({
                balance: userBalance.balance - parseInt(amount),
                bank: userBalance.bank + parseInt(amount)
            });
        }
        
        // Log the transaction
        await UserEconomyLogs.create({
            userId,
            guildId,
            amount: parseInt(amount),
            type: 'transfer',
            location: `${from} to ${to}`,
            reason: reason || 'API transaction'
        });
        
        res.status(200).json({
            success: true,
            data: userBalance
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /economy/logs - Get economy transaction logs
 */
router.get('/logs', async (req: Request, res: Response, next: NextFunction) => {
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
        if (req.query.type) {
            where.type = req.query.type;
        }
        
        const { count, rows: logs } = await UserEconomyLogs.findAndCountAll({
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
            data: logs
        });
    } catch (error) {
        next(error);
    }
});

export default router;