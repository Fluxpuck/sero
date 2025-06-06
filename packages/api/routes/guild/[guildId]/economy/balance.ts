import { Request, Response, Router, NextFunction } from 'express';
import { Op, Transaction } from 'sequelize';
import { UserBalances } from '../../../../models';
import { ResponseHandler } from '../../../../utils/response.utils';
import { ResponseCode } from '../../../../utils/response.types';

// Constants
const MAX_BALANCE = Number.MAX_SAFE_INTEGER / 100;
const DEFAULT_BALANCE = 0;
const PRECISION = 2; // 2 decimal places for currency

// Type Definitions
type BalanceType = 'wallet' | 'bank';
type BalanceResetType = BalanceType | 'both';

interface BalanceQueryParams {
    sortBy?: 'wallet_balance' | 'bank_balance';
    order?: 'ASC' | 'DESC';
}

interface TransferBody {
    amount: number;
    toUserId?: string;
    from: BalanceType;
    to: BalanceType;
}

interface UpdateBalanceBody {
    amount: number;
    type: BalanceType;
    allowNegative?: boolean;
}

interface ResetBalanceBody {
    type?: BalanceResetType;
}

// Utility Functions
const validateAmount = (amount: number): { valid: boolean; message?: string } => {
    if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
        return { valid: false, message: 'Amount must be a valid finite number' };
    }

    if (amount === 0) {
        return { valid: false, message: 'Amount cannot be zero' };
    }

    // Validate amount precision
    const roundedAmount = Number(amount.toFixed(PRECISION));
    if (Math.abs(amount - roundedAmount) > Number.EPSILON) {
        return { valid: false, message: `Amount can only have up to ${PRECISION} decimal places` };
    }

    return { valid: true };
};

const validateBalanceType = (type: string, validTypes: string[] = ['wallet', 'bank']): type is BalanceType => {
    return validTypes.includes(type);
};

const getDefaultBalance = (guildId: string, userId: string): Partial<UserBalances> => ({
    guildId,
    userId,
    wallet_balance: DEFAULT_BALANCE,
    bank_balance: DEFAULT_BALANCE
});

const handleTransactionError = async (transaction: Transaction, error: unknown, next: NextFunction) => {
    if (transaction) {
        await transaction.rollback();
    }
    next(error);
};

const getOrCreateBalance = async (guildId: string, userId: string, transaction?: Transaction) => {
    return await UserBalances.findOrCreate({
        where: { guildId, userId },
        defaults: getDefaultBalance(guildId, userId) as UserBalances,
        ...(transaction && { transaction })
    });
};

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
router.get('/', async (req: Request<{ guildId: string }, {}, {}, BalanceQueryParams>, res: Response, next: NextFunction) => {
    try {
        const { guildId } = req.params;
        const { sortBy = 'bank_balance', order = 'DESC' } = req.query;

        const balances = await UserBalances.findAll({
            where: { guildId },
            order: [[sortBy, order]],
            attributes: ['userId', 'wallet_balance', 'bank_balance', 'updatedAt']
        });

        return ResponseHandler.sendSuccess(res, balances);
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
router.get('/:userId', async (req: Request<{ guildId: string; userId: string }>, res: Response, next: NextFunction) => {
    const transaction = await UserBalances.sequelize!.transaction();

    try {
        const { guildId, userId } = req.params;

        const [balance] = await UserBalances.findOrCreate({
            where: { guildId, userId },
            defaults: getDefaultBalance(guildId, userId) as UserBalances,
            transaction
        });

        await transaction.commit();
        return ResponseHandler.sendSuccess(res, balance);
    } catch (error) {
        await handleTransactionError(transaction, error, next);
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
 */
router.post('/:userId', async (req: Request<{ guildId: string; userId: string }, {}, UpdateBalanceBody>, res: Response, next: NextFunction) => {
    const transaction = await UserBalances.sequelize!.transaction();

    try {
        const { guildId, userId } = req.params;
        const { amount, type, allowNegative = false } = req.body;

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

        if (!validateBalanceType(type)) {
            await transaction.rollback();
            return ResponseHandler.sendError(
                res,
                'Type must be either "wallet" or "bank"',
                ResponseCode.BAD_REQUEST
            );
        }

        const roundedAmount = Number(amount.toFixed(PRECISION));
        const field = `${type}_balance` as const;

        // Find or create balance record
        const [balance] = await UserBalances.findOrCreate({
            where: { guildId, userId },
            defaults: getDefaultBalance(guildId, userId) as UserBalances,
            transaction
        });

        const currentBalance = balance[field];
        const newBalance = currentBalance + roundedAmount;

        // Check for negative balance if not allowed
        if (!allowNegative && newBalance < 0) {
            await transaction.rollback();
            return ResponseHandler.sendError(
                res,
                `Insufficient ${type} balance. Current: ${currentBalance}, Requested: ${Math.abs(roundedAmount)}`,
                ResponseCode.BAD_REQUEST
            );
        }

        // Check for balance overflow
        if (newBalance > MAX_BALANCE) {
            await transaction.rollback();
            return ResponseHandler.sendError(
                res,
                `Balance would exceed maximum allowed value of ${MAX_BALANCE}`,
                ResponseCode.BAD_REQUEST
            );
        }

        // Update balance atomically
        await balance.increment(field, {
            by: roundedAmount,
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
            `${type.charAt(0).toUpperCase() + type.slice(1)} balance updated successfully`
        );
    } catch (error) {
        await handleTransactionError(transaction, error, next);
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
router.post('/:userId/transfer', async (
    req: Request<{ guildId: string; userId: string }, {}, TransferBody>,
    res: Response,
    next: NextFunction
) => {
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


        const roundedAmount = Number(amount.toFixed(PRECISION));
        const fromField = `${from}_balance` as const;
        const toField = `${to}_balance` as const;

        // Get or create sender's balance
        const [senderBalance] = await getOrCreateBalance(guildId, userId, transaction);

        // Check if sender has sufficient balance
        if (senderBalance[fromField] < roundedAmount) {
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
        await handleTransactionError(transaction, error, next);
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
router.delete('/:userId/reset', async (
    req: Request<{ guildId: string; userId: string }, {}, ResetBalanceBody>,
    res: Response,
    next: NextFunction
) => {
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
        await handleTransactionError(transaction, error, next);
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
router.delete('/reset-all', async (req: Request<{ guildId: string }>, res: Response, next: NextFunction) => {
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