import { Request, Response, Router, NextFunction } from 'express';
import { UserBalances } from '../../../../models';
import { ResponseHandler } from '../../../../utils/response.utils';
import { ResponseCode } from '../../../../utils/response.types';
import { validateAmount, validateBalanceType } from '../../../../utils/validate.utils';
import { BalanceQueryParams, BalanceUpdateBody } from '../../../../utils/validate.types';

const DEFAULT_BALANCE = 0;

/**
 * Helper function to get or create a user's balance record
 */
async function getOrCreateBalance(guildId: string, userId: string, transaction: any) {
    const [balance] = await UserBalances.findOrCreate({
        where: { guildId, userId },
        defaults: {
            guildId,
            userId,
            wallet_balance: DEFAULT_BALANCE,
            bank_balance: DEFAULT_BALANCE
        } as UserBalances,
        transaction
    });
    return [balance];
}

const router = Router({ mergeParams: true });

/**
 * @swagger
 * /guild/{guildId}/economy/balance:
 *   get:
 *     summary: Get all balances for a guild
 *     tags:
 *       - Economy
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *       - name: sortBy
 *         in: query
 *         required: false
 *         description: Field to sort by (wallet_balance or bank_balance)
 *         schema:
 *           type: string
 *           enum: [wallet_balance, bank_balance]
 *           default: bank_balance
 *       - name: order
 *         in: query
 *         required: false
 *         description: Sort order (ASC or DESC)
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
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
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserBalances'
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { guildId } = req.params;
        const { sortBy = 'bank_balance', order = 'DESC' } = req.query as BalanceQueryParams;

        const balances = await UserBalances.findAll({
            where: { guildId },
            order: [[sortBy, order]]
        });

        return ResponseHandler.sendSuccess(res, balances, 'Balances retrieved successfully');
    } catch (error) {
        next(error);
    }
});

/**
 * @swagger
 * /guild/{guildId}/economy/balance/{userId}:
 *   get:
 *     summary: Get or initialize balance for a specific user in a guild
 *     tags:
 *       - Economy
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
 *               $ref: '#/components/schemas/UserBalances'
 */
router.get('/:userId', async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await UserBalances.sequelize!.transaction();

    try {
        const { guildId, userId } = req.params;

        const [balance] = await UserBalances.findOrCreate({
            where: { guildId, userId },
            defaults: {
                guildId,
                userId,
                wallet_balance: DEFAULT_BALANCE,
                bank_balance: DEFAULT_BALANCE
            } as UserBalances,
            transaction
        });

        await transaction.commit();
        return ResponseHandler.sendSuccess(res, balance, 'Balance retrieved successfully');
    } catch (error) {
        transaction.rollback();
        next(error);
    }
});

/**
 * @swagger
 * /guild/{guildId}/economy/balance/{userId}:
 *   post:
 *     summary: Update a user's balance
 *     tags:
 *       - Economy
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
 *             required: [amount, type]
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Amount to add (positive) or subtract (negative)
 *               type:
 *                 type: string
 *                 enum: [wallet, bank]
 *                 description: Type of balance to update
 *               allowNegative:
 *                 type: boolean
 *                 default: false
 *                 description: Whether to allow negative balances
 *     responses:
 *       200:
 *         description: Balance updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserBalances'
 *       400:
 *         description: Invalid input or insufficient balance
 *       404:
 *         description: User or guild not found
 */
router.post('/:userId', async (req: Request, res: Response, next: NextFunction) => {
    if (!UserBalances.sequelize) {
        return ResponseHandler.sendError(
            res,
            'Database connection not available',
            ResponseCode.INTERNAL_SERVER_ERROR
        );
    }

    const transaction = await UserBalances.sequelize.transaction();

    try {
        const { guildId, userId } = req.params;
        const { amount, type, allowNegative = false } = req.body as BalanceUpdateBody;

        // Input validation
        if (!validateAmount(amount) || !validateBalanceType(type)) {
            await transaction.rollback();
            return ResponseHandler.sendError(
                res,
                'Invalid amount or balance type',
                ResponseCode.BAD_REQUEST
            );
        }

        // Find or create user balance
        const [balance] = await UserBalances.findOrCreate({
            where: { guildId, userId },
            defaults: {
                guildId,
                userId,
                wallet_balance: DEFAULT_BALANCE,
                bank_balance: DEFAULT_BALANCE
            } as any, // Type assertion to handle Sequelize types
            transaction
        });

        // Update the appropriate balance
        const balanceField = type === 'wallet' ? 'wallet_balance' : 'bank_balance';
        const currentBalance = balance.getDataValue(balanceField) as number;
        const newBalance = currentBalance + amount;

        // Check for negative balance if not allowed
        if (newBalance < 0 && !allowNegative) {
            await transaction.rollback();
            return ResponseHandler.sendError(
                res,
                'Insufficient balance',
                ResponseCode.BAD_REQUEST
            );
        }

        // Update the balance
        await balance.update({ [balanceField]: newBalance }, { transaction });
        await transaction.commit();

        // Refresh to get the latest data
        const updatedBalance = await UserBalances.findOne({
            where: { guildId, userId }
        });

        return ResponseHandler.sendSuccess(
            res, 
            updatedBalance,
            `${type.charAt(0).toUpperCase() + type.slice(1)} balance updated successfully`
        );
    } catch (error) {
        await transaction.rollback();
        next(error);
    }
});



/**
 * @swagger
 * /guild/{guildId}/economy/balance/{userId}/transfer:
 *   post:
 *     summary: Transfer money between wallets/banks
 *     tags:
 *       - Economy
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
 *             required: [amount, from, to]
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *                 description: Amount to transfer (minimum 0.01)
 *               from:
 *                 type: string
 *                 enum: [wallet, bank]
 *                 description: Source of funds
 *               to:
 *                 type: string
 *                 enum: [wallet, bank]
 *                 description: Destination of funds
 *               toUserId:
 *                 type: string
 *                 description: User ID to transfer to (if different from current user)
 *     responses:
 *       200:
 *         description: Transfer successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserBalances'
 *       400:
 *         description: Invalid input or insufficient balance
 */
router.post('/:userId/transfer', async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await UserBalances.sequelize!.transaction();

    try {
        const { guildId, userId } = req.params;
        const { amount, from, to, toUserId } = req.body;
        const targetUserId = toUserId || userId;
        const isSameUser = targetUserId === userId;

        // Input validation
        const amountValidation = validateAmount(amount);
        if (!amountValidation.valid) {
            await transaction.rollback();
            return ResponseHandler.sendError(
                res,
                amountValidation.message!,
                ResponseCode.BAD_REQUEST
            );
        }

        if (!validateBalanceType(from) || !validateBalanceType(to)) {
            await transaction.rollback();
            return ResponseHandler.sendError(
                res,
                'Both "from" and "to" must be either "wallet" or "bank"',
                ResponseCode.BAD_REQUEST
            );
        }

        if (isSameUser && from === to) {
            await transaction.rollback();
            return ResponseHandler.sendError(
                res,
                'Cannot transfer to the same account',
                ResponseCode.BAD_REQUEST
            );
        }

        const roundedAmount = Math.round(amount);
        const fromField = `${from}_balance` as keyof UserBalances;
        const toField = `${to}_balance` as keyof UserBalances;

        // Get or create sender's balance
        const [senderBalance] = await getOrCreateBalance(guildId, userId, transaction);

        // Check if sender has sufficient balance
        if (senderBalance.getDataValue(fromField) < roundedAmount) {
            await transaction.rollback();
            return ResponseHandler.sendError(
                res,
                `Insufficient ${from} balance. Current: ${senderBalance[fromField]}, Required: ${roundedAmount}`,
                ResponseCode.BAD_REQUEST
            );
        }

        // Handle transfer to another user
        if (!isSameUser) {
            // Get or create receiver's balance
            const [receiverBalance] = await getOrCreateBalance(guildId, targetUserId, transaction);

            // Update balances atomically
            await Promise.all([
                senderBalance.decrement(fromField, { by: roundedAmount, transaction }),
                receiverBalance.increment(toField, { by: roundedAmount, transaction })
            ]);
        } else {
            // Internal transfer (same user, different accounts)
            await senderBalance.increment(toField, { by: roundedAmount, transaction });
            await senderBalance.decrement(fromField, { by: roundedAmount, transaction });
        }

        // Fetch updated sender's balance
        const updatedSender = await UserBalances.findByPk(senderBalance.id, {
            transaction,
            attributes: ['userId', 'wallet_balance', 'bank_balance', 'updatedAt']
        });

        await transaction.commit();

        return ResponseHandler.sendSuccess(
            res,
            updatedSender,
            `Successfully transferred ${roundedAmount} from ${from} to ${to}${!isSameUser ? ` (User: ${targetUserId})` : ''}`
        );
    } catch (error) {
        transaction.rollback();
        next(error)
    }
});

/**
 * @swagger
 * /guild/{guildId}/economy/balance/{userId}/reset:
 *   delete:
 *     summary: Reset user's balance
 *     tags:
 *       - Economy
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
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [wallet, bank, both]
 *                 default: both
 *                 description: Type of balance to reset
 *     responses:
 *       200:
 *         description: Balance reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserBalances'
 *       400:
 *         description: Invalid reset type
 */
router.delete('/:userId/reset', async (req: Request, res: Response, next: NextFunction) => {
    const transaction = await UserBalances.sequelize!.transaction();

    try {
        const { guildId, userId } = req.params;
        const { type = 'both' } = req.body;

        // Validate reset type
        if (!['wallet', 'bank', 'both'].includes(type)) {
            await transaction.rollback();
            return ResponseHandler.sendError(
                res,
                'Type must be "wallet", "bank", or "both"',
                ResponseCode.BAD_REQUEST
            );
        }

        // Get or create balance record
        const [balance] = await getOrCreateBalance(guildId, userId, transaction);

        // Prepare update object
        const updateData: Partial<UserBalances> = { guildId, userId };

        if (type === 'both') {
            updateData.wallet_balance = DEFAULT_BALANCE;
            updateData.bank_balance = DEFAULT_BALANCE;
        } else if (type === 'wallet') {
            updateData.wallet_balance = DEFAULT_BALANCE;
        } else if (type === 'bank') {
            updateData.bank_balance = DEFAULT_BALANCE;
        }

        // Update the balance
        await UserBalances.update(updateData, {
            where: { guildId, userId },
            transaction
        });

        // Fetch the updated balance
        const updatedBalance = await UserBalances.findByPk(balance.id, {
            transaction,
            attributes: ['userId', 'wallet_balance', 'bank_balance', 'updatedAt']
        });

        await transaction.commit();

        return ResponseHandler.sendSuccess(
            res,
            updatedBalance,
            type === 'both'
                ? 'Wallet and bank balances have been reset'
                : `${type.charAt(0).toUpperCase() + type.slice(1)} balance has been reset`
        );
    } catch (error) {
        transaction.rollback();
        next(error);
    }
});

/**
 * @swagger
 * /guild/{guildId}/economy/balance/reset-all:
 *   delete:
 *     summary: Reset all balances in a guild
 *     tags:
 *       - Economy
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: The Discord ID of the guild
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: All balances reset successfully
 */
router.delete('/reset-all', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { guildId } = req.params;

        const [updatedCount] = await UserBalances.update(
            { wallet_balance: 0, bank_balance: 0 },
            { where: { guildId } }
        );

        return ResponseHandler.sendSuccess(
            res,
            { updatedCount },
            'All balances reset successfully'
        );
    } catch (error) {
        next(error);
    }
});

export default router;