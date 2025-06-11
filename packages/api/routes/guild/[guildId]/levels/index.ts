import { Request, Response, Router, NextFunction } from 'express';
import { Op } from 'sequelize';
import { UserLevel, LevelRank, Modifier } from '../../../../models';
import { ResponseHandler } from '../../../../utils/response.utils';
import { ResponseCode } from '../../../../utils/response.types';
import { getOrCreateUserLevel } from './gain';
import { logUserExperience } from '../../../../utils/log.utils';
import { UserExperienceLogType } from '../../../../models/user-experience-logs.model';

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /guild/{guildId}/levels:
 *   get:
 *     summary: Get the level data for all users in a guild
 *     tags:
 *       - Levels
 *     parameters:
 *       - in: path
 *         name: guildId
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of user levels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserLevel'
 *       404:
 *         description: Guild not found
 *       500:
 *         description: Server error
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { guildId } = req.params;

        const userLevels = await UserLevel.findAll({
            where: { guildId },
            order: [
                ['rank', 'ASC'],
                ['experience', 'DESC'],
            ],
        });

        return ResponseHandler.sendSuccess(res, userLevels, 'User levels retrieved successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /guild/{guildId}/levels/{userId}:
 *   get:
 *     summary: Get the level data for a specific user
 *     tags:
 *       - Levels
 *     parameters:
 *       - in: path
 *         name: guildId
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         description: The Discord ID of the user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User level data
 *         content:
 *           application/json:
 *             schema:
 *               type:  object
 *               properties:
 *                 userLevel:
 *                   $ref: '#/components/schemas/UserLevel'
 *                 modifier:
 *                   $ref: '#/components/schemas/Modifier'
 *       404:
 *         description: Guild not found
 *       500:
 *         description: Server error
 */
router.get('/:userId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { guildId, userId } = req.params;

        const [userLevel, created] = await UserLevel.findOrCreate({
            where: { guildId, userId },
            defaults: {
                guildId,
                userId,
            } as UserLevel,
        });

        const modifier = await Modifier.findOne({ where: { userId, guildId } })

        const ranks = await LevelRank.findAll({
            where: {
                guildId: guildId,
                level: { [Op.lte]: userLevel.level },
            },
            order: [['level', 'ASC']],
        });

        const response = {
            userLevel,
            modifier: modifier?.amount ?? 1,
            ranks: ranks ?? []
        };

        return ResponseHandler.sendSuccess(res, response, 'User level retrieved successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /guild/{guildId}/levels/give/{userId}:
 *   post:
 *     summary: Increase a user's level by the given amount
 *     tags:
 *       - Levels
 *     parameters:
 *       - in: path
 *         name: guildId
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         description: The Discord ID of the user
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: The amount to increase the user's level
 *     responses:
 *       200:
 *         description: User level updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type:  object
 *               properties:
 *                 userLevel:
 *                   $ref: '#/components/schemas/UserLevel'
 *                 modifier:
 *                   $ref: '#/components/schemas/Modifier'
 *       404:
 *         description: Guild not found
 *       500:
 *         description: Server error
 */
router.post('/give/:userId', async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await UserLevel.sequelize!.transaction();

    try {
        const { guildId, userId } = req.params;
        const { amount = 0, originId } = req.body;

        // Validate required fields
        if (!amount) {
            return ResponseHandler.sendValidationFail(
                res,
                'Missing required fields',
                ['Amount is a required field']
            );
        }

        if (amount !== Number(amount)) {
            return ResponseHandler.sendValidationFail(
                res,
                'Invalid amount',
                ['Amount must be a number']
            );
        }

        // Get or create user level
        const [userLevel] = await getOrCreateUserLevel(guildId, userId, transaction);

        // Update user level
        userLevel.experience += amount;
        await userLevel.save({ transaction });

        await transaction.commit();

        ResponseHandler.sendSuccess(res, userLevel, `Gave ${amount} experience to user`);

        // Log the user experience increase
        logUserExperience(guildId, userId, UserExperienceLogType.GIVE, amount, originId);

    } catch (error) {
        transaction.rollback();
        next(error);
    }
});

/**
 * @swagger
 * /guild/{guildId}/levels/remove/{userId}:
 *   post:
 *     summary: Decrease a user's level by the given amount
 *     tags:
 *       - Levels
 *     parameters:
 *       - in: path
 *         name: guildId
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         description: The Discord ID of the user
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 description: The amount to decrease the user's level
 *     responses:
 *       200:
 *         description: User level updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type:  object
 *               properties:
 *                 userLevel:
 *                   $ref: '#/components/schemas/UserLevel'
 *                 modifier:
 *                   $ref: '#/components/schemas/Modifier'
 *       404:
 *         description: Guild not found
 *       500:
 *         description: Server error
 */
router.post('/remove/:userId', async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await UserLevel.sequelize!.transaction();

    try {
        const { guildId, userId } = req.params;
        const { amount = 0, originId } = req.body;

        // Validate required fields
        if (!amount) {
            return ResponseHandler.sendValidationFail(
                res,
                'Missing required fields',
                ['Amount is a required field']
            );
        }

        if (amount !== Number(amount)) {
            return ResponseHandler.sendValidationFail(
                res,
                'Invalid amount',
                ['Amount must be a number']
            );
        }

        // Get or create user level
        const [userLevel] = await getOrCreateUserLevel(guildId, userId, transaction);

        // Update user level
        userLevel.experience -= amount;
        if (userLevel.experience < 0) {
            userLevel.experience = 0;
        }

        await userLevel.save({ transaction });

        await transaction.commit();

        ResponseHandler.sendSuccess(res, userLevel, `Removed ${amount} experience from user`);

        // Log the user experience decrease
        logUserExperience(guildId, userId, UserExperienceLogType.REMOVE, amount, originId);

    } catch (error) {
        transaction.rollback();
        next(error);
    }
});

export default router;
