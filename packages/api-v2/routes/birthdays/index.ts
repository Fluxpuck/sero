import { Request, Response, Router, NextFunction } from 'express';
import { UserBirthdays, User, Guild } from '../../models';

const router = Router();

/**
 * GET /birthdays - Get all birthdays
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
        if (req.query.month) {
            where.month = parseInt(req.query.month as string);
        }
        if (req.query.day) {
            where.day = parseInt(req.query.day as string);
        }
        
        const { count, rows: birthdays } = await UserBirthdays.findAndCountAll({
            where,
            limit,
            offset,
            order: [['month', 'ASC'], ['day', 'ASC']],
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
            data: birthdays
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /birthdays/:userId/:guildId - Get birthday for a specific user
 */
router.get('/:userId/:guildId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, guildId } = req.params;
        
        const birthday = await UserBirthdays.findOne({
            where: { userId, guildId },
            include: [{ model: User, as: 'user' }]
        });
        
        if (!birthday) {
            const error: any = new Error('Birthday not found');
            error.statusCode = 404;
            return next(error);
        }
        
        res.status(200).json({
            success: true,
            data: birthday
        });
    } catch (error) {
        next(error);
    }
});

/**
 * GET /birthdays/upcoming/:guildId - Get upcoming birthdays for a guild
 */
router.get('/upcoming/:guildId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { guildId } = req.params;
        const days = parseInt(req.query.days as string) || 30;
        
        // Verify guild exists
        const guild = await Guild.findOne({ where: { guildId } });
        
        if (!guild) {
            const error: any = new Error('Guild not found');
            error.statusCode = 404;
            return next(error);
        }
        
        const today = new Date();
        const currentMonth = today.getMonth() + 1; // JS months are 0-indexed
        const currentDay = today.getDate();
        
        // Find all birthdays
        const allBirthdays = await UserBirthdays.findAll({
            where: { guildId },
            include: [{ model: User, as: 'user' }]
        });
        
        // Calculate days until birthday for each user
        const birthdays = allBirthdays.map(birthday => {
            const birthMonth = birthday.month;
            const birthDay = birthday.day;
            
            // Create dates for this year's birthday
            const thisYearBirthday = new Date(today.getFullYear(), birthMonth - 1, birthDay);
            
            // If birthday has passed this year, use next year's date
            if (
                (birthMonth < currentMonth) || 
                (birthMonth === currentMonth && birthDay < currentDay)
            ) {
                thisYearBirthday.setFullYear(today.getFullYear() + 1);
            }
            
            // Calculate days difference
            const diffTime = thisYearBirthday.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            return {
                ...birthday.toJSON(),
                daysUntilBirthday: diffDays
            };
        });
        
        // Filter to get only upcoming birthdays within the specified days
        const upcomingBirthdays = birthdays
            .filter(birthday => birthday.daysUntilBirthday <= days)
            .sort((a, b) => a.daysUntilBirthday - b.daysUntilBirthday);
        
        res.status(200).json({
            success: true,
            data: upcomingBirthdays
        });
    } catch (error) {
        next(error);
    }
});

/**
 * POST /birthdays - Create or update a birthday
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, guildId, month, day, year, timezone } = req.body;
        
        if (!userId || !guildId || !month || !day) {
            const error: any = new Error('UserId, GuildId, month, and day are required');
            error.statusCode = 400;
            return next(error);
        }
        
        // Validate date
        if (month < 1 || month > 12) {
            const error: any = new Error('Month must be between 1 and 12');
            error.statusCode = 400;
            return next(error);
        }
        
        const daysInMonth = new Date(year || 2000, month, 0).getDate();
        if (day < 1 || day > daysInMonth) {
            const error: any = new Error(`Day must be between 1 and ${daysInMonth} for the selected month`);
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
        
        // Find or create the birthday
        const [birthday, created] = await UserBirthdays.findOrCreate({
            where: { userId, guildId },
            defaults: {
                month,
                day,
                year,
                timezone: timezone || 'UTC'
            }
        });
        
        // If not created, update the values
        if (!created) {
            await birthday.update({
                month,
                day,
                year,
                timezone: timezone || birthday.timezone
            });
        }
        
        res.status(created ? 201 : 200).json({
            success: true,
            data: birthday
        });
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE /birthdays/:userId/:guildId - Delete a birthday
 */
router.delete('/:userId/:guildId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, guildId } = req.params;
        
        const birthday = await UserBirthdays.findOne({
            where: { userId, guildId }
        });
        
        if (!birthday) {
            const error: any = new Error('Birthday not found');
            error.statusCode = 404;
            return next(error);
        }
        
        await birthday.destroy();
        
        res.status(200).json({
            success: true,
            message: 'Birthday deleted successfully'
        });
    } catch (error) {
        next(error);
    }
});

export default router;