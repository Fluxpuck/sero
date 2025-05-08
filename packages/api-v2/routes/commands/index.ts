import { Request, Response, Router, NextFunction } from 'express';
import { Commands, CommandLogs, User, Guild } from '../../models';

const router = Router();

/**
 * GET /commands - Retrieve all commands
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = (page - 1) * limit;
        
        const { count, rows: commands } = await Commands.findAndCountAll({
            limit,
            offset,
            order: [['name', 'ASC']]
        });
        
        res.status(200).json({
            success: true,
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
            data: commands
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /commands/:id - Retrieve a specific command
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        
        const command = await Commands.findByPk(id);
        
        if (!command) {
            const error: any = new Error('Command not found');
            error.statusCode = 404;
            return next(error);
        }
        
        res.status(200).json({
            success: true,
            data: command
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /commands/name/:name - Retrieve a command by name
 */
router.get('/name/:name', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.params;
        
        const command = await Commands.findOne({
            where: { name }
        });
        
        if (!command) {
            const error: any = new Error('Command not found');
            error.statusCode = 404;
            return next(error);
        }
        
        res.status(200).json({
            success: true,
            data: command
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /commands - Register a new command
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description, category, enabled } = req.body;
        
        if (!name || !description) {
            const error: any = new Error('Name and description are required');
            error.statusCode = 400;
            return next(error);
        }
        
        // Check if command already exists
        const existingCommand = await Commands.findOne({
            where: { name }
        });
        
        if (existingCommand) {
            const error: any = new Error('Command with this name already exists');
            error.statusCode = 409;
            return next(error);
        }
        
        const command = await Commands.create({
            name,
            description,
            category: category || 'general',
            enabled: enabled !== undefined ? enabled : true
        });
        
        res.status(201).json({
            success: true,
            data: command
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /commands/:id - Update a command
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, description, category, enabled } = req.body;
        
        const command = await Commands.findByPk(id);
        
        if (!command) {
            const error: any = new Error('Command not found');
            error.statusCode = 404;
            return next(error);
        }
        
        await command.update({
            name: name || command.name,
            description: description || command.description,
            category: category || command.category,
            enabled: enabled !== undefined ? enabled : command.enabled
        });
        
        res.status(200).json({
            success: true,
            data: command
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /commands/logs - Get command execution logs
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
        if (req.query.commandId) {
            where.commandId = req.query.commandId;
        }
        if (req.query.executorId) {
            where.executorId = req.query.executorId;
        }
        
        const { count, rows: logs } = await CommandLogs.findAndCountAll({
            where,
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            include: [
                { model: Commands, as: 'command' },
                { model: User, as: 'executor' },
                { model: Guild, as: 'guild' }
            ]
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

/**
 * POST /commands/logs - Log a command execution
 */
router.post('/logs', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { commandId, guildId, executorId, name } = req.body;
        
        if (!commandId || !guildId || !executorId) {
            const error: any = new Error('CommandId, GuildId and ExecutorId are required');
            error.statusCode = 400;
            return next(error);
        }
        
        // Verify command exists
        const command = await Commands.findByPk(commandId);
        
        if (!command) {
            const error: any = new Error('Command not found');
            error.statusCode = 404;
            return next(error);
        }
        
        const log = await CommandLogs.create({
            commandId,
            guildId,
            executorId,
            name: name || command.name
        });
        
        res.status(201).json({
            success: true,
            data: log
        });
    } catch (error) {
        next(error);
    }
});

export default router;