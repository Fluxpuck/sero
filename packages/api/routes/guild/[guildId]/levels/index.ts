import { Request, Response, Router, NextFunction } from 'express';
import { UserLevel, Modifier } from '../../../../models';
import { ResponseHandler } from '../../../../utils/response.utils';
import { ResponseCode } from '../../../../utils/response.types';

// Enable mergeParams to access parent route parameters
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

        const [userLevel, modifier] = await Promise.all([
            UserLevel.findOrCreate({
                where: { guildId, userId },
                defaults: {
                    guildId,
                    userId,
                } as UserLevel,
            }),
            Modifier.findOne({ where: { guildId, userId } })
        ]);

        // Add modifier to user level object
        const userLevelWithModifier = {
            userLevel,
            modifier
        };

        return ResponseHandler.sendSuccess(res, userLevelWithModifier, 'User level retrieved successfully');
    } catch (error) {
        next(error);
    }
});

export default router;