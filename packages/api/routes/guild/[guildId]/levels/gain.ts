import { Request, Response, Router, NextFunction } from 'express';
import { Transaction } from 'sequelize';
import { UserLevel, Modifier } from '../../../../models';
import { ResponseHandler } from '../../../../utils/response.utils';
import { ResponseCode } from '../../../../utils/response.types';
import { calculateXp } from '../../../../utils/levels.utils';

/**
 * Helper function to get or create a user's balance record
 */
async function getOrCreateUserLevel(guildId: string, userId: string, transaction: Transaction) {
    const [userLevel] = await UserLevel.findOrCreate({
        where: { guildId, userId },
        defaults: {
            guildId,
            userId,
        } as UserLevel,
        transaction
    });
    return [userLevel];
}

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /guild/{guildId}/levels/gain/{userId}:
 *   post:
 *     summary: Increase a user's level by the guild's level gain modifier
 *     tags:
 *       - Levels
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *       - name: userId
 *         in: path
 *         required: true
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
 *               userId:
 *                 type: string
 *                 description: The Discord ID of the user
 *     responses:
 *       200:
 *         description: User level updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserLevel'
 */
router.post('/:userId', async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await UserLevel.sequelize!.transaction();

    try {
        const { guildId } = req.params;
        const { userId } = req.body;

        // Validate required fields
        if (!userId) {
            return ResponseHandler.sendValidationFail(
                res,
                'Missing required fields',
                ['userId is required']
            );
        }

        // Get Guild and User modifiers
        const guild_modifier = await Modifier.findOne({ where: { guildId } });
        const user_modifier = await Modifier.findOne({ where: { guildId, userId } });

        // Calculate gain based on modifiers
        const gain = calculateXp(guild_modifier?.amount, user_modifier?.amount);

        // Get or create user level
        const [userLevel] = await getOrCreateUserLevel(guildId, userId, transaction);

        // Update user level
        userLevel.experience += gain;
        await userLevel.save({ transaction });

        await transaction.commit();

        ResponseHandler.sendSuccess(res, userLevel, `User gained ${gain} experience`);
    } catch (error) {
        transaction.rollback();
        next(error);
    }
});


export default router;