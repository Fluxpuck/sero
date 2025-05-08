import { Request, Response, Router, NextFunction } from 'express';
import { Jobs, UserCareers, User, Guild } from '../../models';

const router = Router();

/**
 * GET /jobs - Get all available jobs
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = (page - 1) * limit;
        
        const { count, rows: jobs } = await Jobs.findAndCountAll({
            limit,
            offset,
            order: [['salary', 'DESC']]
        });
        
        res.status(200).json({
            success: true,
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
            data: jobs
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /jobs/:id - Get a specific job by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        
        const job = await Jobs.findByPk(id);
        
        if (!job) {
            const error: any = new Error('Job not found');
            error.statusCode = 404;
            return next(error);
        }
        
        res.status(200).json({
            success: true,
            data: job
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /jobs/name/:name - Get a job by name
 */
router.get('/name/:name', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.params;
        
        const job = await Jobs.findOne({
            where: { name }
        });
        
        if (!job) {
            const error: any = new Error('Job not found');
            error.statusCode = 404;
            return next(error);
        }
        
        res.status(200).json({
            success: true,
            data: job
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /jobs - Create a new job
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, description, salary, requirements } = req.body;
        
        if (!name || !salary) {
            const error: any = new Error('Name and salary are required');
            error.statusCode = 400;
            return next(error);
        }
        
        // Check if job already exists
        const existingJob = await Jobs.findOne({
            where: { name }
        });
        
        if (existingJob) {
            const error: any = new Error('Job with this name already exists');
            error.statusCode = 409;
            return next(error);
        }
        
        const job = await Jobs.create({
            name,
            description,
            salary,
            requirements: requirements || {}
        });
        
        res.status(201).json({
            success: true,
            data: job
        });
    } catch (error) {
        next(error);
    }
});

/**
 * PUT /jobs/:id - Update a job
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { name, description, salary, requirements } = req.body;
        
        const job = await Jobs.findByPk(id);
        
        if (!job) {
            const error: any = new Error('Job not found');
            error.statusCode = 404;
            return next(error);
        }
        
        await job.update({
            name: name || job.name,
            description: description !== undefined ? description : job.description,
            salary: salary !== undefined ? salary : job.salary,
            requirements: requirements !== undefined ? requirements : job.requirements
        });
        
        res.status(200).json({
            success: true,
            data: job
        });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /jobs/:id - Delete a job
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        
        const job = await Jobs.findByPk(id);
        
        if (!job) {
            const error: any = new Error('Job not found');
            error.statusCode = 404;
            return next(error);
        }
        
        // Check if any users have this job
        const employedUsers = await UserCareers.count({
            where: { jobId: id }
        });
        
        if (employedUsers > 0) {
            const error: any = new Error(`Cannot delete job. ${employedUsers} users are currently employed with this job.`);
            error.statusCode = 400;
            return next(error);
        }
        
        await job.destroy();
        
        res.status(200).json({
            success: true,
            message: 'Job deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /jobs/careers/:guildId - Get all user careers for a guild
 */
router.get('/careers/:guildId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { guildId } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const offset = (page - 1) * limit;
        
        // Verify guild exists
        const guild = await Guild.findOne({ where: { guildId } });
        
        if (!guild) {
            const error: any = new Error('Guild not found');
            error.statusCode = 404;
            return next(error);
        }
        
        const { count, rows: careers } = await UserCareers.findAndCountAll({
            where: { guildId },
            limit,
            offset,
            include: [
                { model: User, as: 'user' },
                { model: Jobs, as: 'job' }
            ],
            order: [['createdAt', 'DESC']]
        });
        
        res.status(200).json({
            success: true,
            total: count,
            page,
            limit,
            totalPages: Math.ceil(count / limit),
            data: careers
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /jobs/careers/:userId/:guildId - Get a user's career
 */
router.get('/careers/:userId/:guildId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, guildId } = req.params;
        
        const career = await UserCareers.findOne({
            where: { userId, guildId },
            include: [{ model: Jobs, as: 'job' }]
        });
        
        if (!career) {
            const error: any = new Error('Career not found');
            error.statusCode = 404;
            return next(error);
        }
        
        res.status(200).json({
            success: true,
            data: career
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /jobs/careers - Assign a job to a user
 */
router.post('/careers', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, guildId, jobId, level, experience } = req.body;
        
        if (!userId || !guildId || !jobId) {
            const error: any = new Error('UserId, GuildId, and JobId are required');
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
        
        // Check if job exists
        const job = await Jobs.findByPk(jobId);
        
        if (!job) {
            const error: any = new Error('Job not found');
            error.statusCode = 404;
            return next(error);
        }
        
        // Check if user already has a career
        const existingCareer = await UserCareers.findOne({
            where: { userId, guildId }
        });
        
        if (existingCareer) {
            await existingCareer.update({
                jobId,
                level: level !== undefined ? level : existingCareer.level,
                experience: experience !== undefined ? experience : existingCareer.experience
            });
            
            return res.status(200).json({
                success: true,
                data: existingCareer
            });
        }
        
        // Create new career
        const career = await UserCareers.create({
            userId,
            guildId,
            jobId,
            level: level || 1,
            experience: experience || 0
        });
        
        res.status(201).json({
            success: true,
            data: career
        });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /jobs/careers/:userId/:guildId - Remove a job from a user
 */
router.delete('/careers/:userId/:guildId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, guildId } = req.params;
        
        const career = await UserCareers.findOne({
            where: { userId, guildId }
        });
        
        if (!career) {
            const error: any = new Error('Career not found');
            error.statusCode = 404;
            return next(error);
        }
        
        await career.destroy();
        
        res.status(200).json({
            success: true,
            message: 'User career removed successfully'
        });
    } catch (error) {
        next(error);
    }
});

export default router;