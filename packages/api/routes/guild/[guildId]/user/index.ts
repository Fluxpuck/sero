import { Request, Response, Router, NextFunction } from 'express';
import { User } from '../../../../models';
import { UserType } from '../../../../models/user.model';
import { ResponseHandler } from '../../../../utils/response.utils';
import { ResponseCode } from '../../../../utils/response.types';
import { Op } from 'sequelize';

// Enable mergeParams to access parent route parameters
const router = Router({ mergeParams: true });

/**
 * @swagger
 * /guild/{guildId}/user:
 *   get:
 *     summary: Get users in a guild with optional search by username
 *     tags:
 *       - Users
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *       - name: username
 *         in: query
 *         required: false
 *         description: Username to search for (case-insensitive partial match)
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       500:
 *         description: Server error
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { guildId } = req.params;
        const { username } = req.query;

        const whereClause: any = { guildId };

        if (username) {
            whereClause.username = {
                [Op.iLike]: `%${username}%`
            };
        }

        const users = await User.findAll({
            where: whereClause,
            order: [['username', 'ASC']]
        });

        ResponseHandler.sendSuccess(res, users, 'Users retrieved successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /guild/{guildId}/user/{userId}:
 *   get:
 *     summary: Get a specific user in a guild
 *     tags:
 *       - Users
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
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/:userId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { guildId, userId } = req.params;

        const user = await User.findOne({
            where: { guildId, userId }
        });

        if (!user) {
            return ResponseHandler.sendError(
                res,
                'User not found for this user',
                ResponseCode.NOT_FOUND
            );
        }

        ResponseHandler.sendSuccess(res, user, 'User retrieved successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /guild/{guildId}/user:
 *   post:
 *     summary: Create or update a user in a guild
 *     tags:
 *       - Users
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - username
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The Discord ID of the user
 *               username:
 *                 type: string
 *                 description: The username of the user
 *               premium:
 *                 type: boolean
 *                 description: Whether the user has premium status
 *               userType:
 *                 type: string
 *                 enum: [admin, moderator, user]
 *                 default: user
 *                 description: The type/role of the user
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await User.sequelize!.transaction();

    try {
        const { guildId } = req.params;
        const { userId, username, premium = false, userType = UserType.USER } = req.body;

        // Validate required fields
        if (!userId || !username) {
            return ResponseHandler.sendValidationFail(
                res,
                'Missing required fields',
                ['userId and username are required fields']
            );
        }

        // Validate userType
        if (!Object.values(UserType).includes(userType)) {
            return ResponseHandler.sendValidationFail(
                res,
                'Invalid user type',
                [`userType must be one of: ${Object.values(UserType).join(', ')}`]
            );
        }


        // Upsert the user
        const [user, created] = await User.upsert({
            guildId,
            userId,
            username,
            premium,
            userType
        } as any, {
            returning: true,
            conflictFields: ['userId', 'guildId']
        });

        // Send appropriate response based on whether user was created or updated
        if (created) {
            ResponseHandler.sendSuccess(res, user, 'User created successfully', 201);
        } else {
            ResponseHandler.sendSuccess(res, user, 'User updated successfully');
        }
    } catch (error) {
        transaction.rollback();
        next(error);
    }
});

/**
 * @swagger
 * /guild/{guildId}/user/{userId}:
 *   delete:
 *     summary: Soft delete a user from a guild
 *     tags:
 *       - Users
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
 *         description: The Discord ID of the user to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.delete('/:userId', async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await User.sequelize!.transaction();

    try {
        const { guildId, userId } = req.params;

        // Find the user first to check if it exists
        const user = await User.findOne({
            where: { guildId, userId }
        });

        if (!user) {
            return ResponseHandler.sendError(
                res,
                'User not found for this user',
                ResponseCode.NOT_FOUND
            );
        }

        // Soft delete the user
        await user.destroy();

        ResponseHandler.sendSuccess(res, null, 'User deleted successfully');
    } catch (error) {
        transaction.rollback();
        next(error);
    }
});

export default router;