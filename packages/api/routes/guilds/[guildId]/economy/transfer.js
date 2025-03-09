const express = require("express");
const router = express.Router({ mergeParams: true });

const { sequelize } = require('../../../../database/sequelize');
const { User, UserWallet, UserBank } = require("../../../../database/models");
const { findOneRecord, withTransaction } = require("../../../../utils/RequestManager");
const { CreateError, RequestError } = require("../../../../utils/ClassManager");

// Define limits
const WALLET_MIN = UserWallet.MINIMUM_BALANCE;
const WALLET_MAX = UserWallet.MAXIMUM_BALANCE;
const BANK_MIN = -UserBank.MINIMUM_BALANCE;
const BANK_MAX = UserBank.MAXIMUM_BALANCE;

function transferMoney(source, destination, amount, type) {
    // Prevent negative transfers
    if (amount <= 0) {
        return {
            sourceBalance: source.balance,
            destinationBalance: destination.balance,
            transferredAmount: 0
        };
    }

    let actualTransferAmount = amount;
    const sourceBalance = source.balance;
    const destinationBalance = destination.balance;

    // Check source has sufficient funds
    const availableFromSource = type === 'toBank'
        ? Math.max(0, sourceBalance - WALLET_MIN)  // For wallet: can only use what's above minimum
        : Math.max(0, sourceBalance + BANK_MIN);   // For bank: can use up to negative minimum

    actualTransferAmount = Math.min(actualTransferAmount, availableFromSource);

    // Check destination won't exceed maximum
    const spaceInDestination = type === 'toBank'
        ? BANK_MAX - destinationBalance
        : WALLET_MAX - destinationBalance;

    actualTransferAmount = Math.min(actualTransferAmount, spaceInDestination);

    // Calculate new balances
    const newSourceBalance = sourceBalance - actualTransferAmount;
    const newDestinationBalance = destinationBalance + actualTransferAmount;

    return {
        sourceBalance: newSourceBalance,
        destinationBalance: newDestinationBalance,
        transferredAmount: actualTransferAmount
    };
}

router.post("/wallet-to-bank/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const { amount } = req.body;

    // Validate input
    if (!amount || typeof amount !== "number") {
        throw new RequestError(400, "Invalid amount. Must be a valid number", {
            method: req.method, path: req.path
        });
    }

    try {

        const result = await withTransaction(async (t) => {

            const user = await findOneRecord(User, { where: { userId, guildId } });
            if (!user) {
                throw new CreateError(404, "User not found");
            }

            const userBank = await findOneRecord(UserBank, { where: { userId, guildId } });
            const userWallet = await findOneRecord(UserWallet, { where: { userId, guildId } });

            if (!userBank || !userWallet) {
                throw new CreateError(404, "User bank or wallet not found");
            }

            const previousWalletBalance = userWallet.balance;
            const previousBankBalance = userBank.balance;

            const { sourceBalance: newWalletBalance, destinationBalance: newBankBalance, transferredAmount } = transferMoney(userWallet, userBank, amount, 'toBank');

            // Store transaction in database
            await sequelize.transaction(async (t) => {
                userWallet.balance = newWalletBalance;
                userBank.balance = newBankBalance;

                await userWallet.save({ transaction: t });
                await userBank.save({ transaction: t });
            });

            return {
                message: "Transfer from wallet to bank successful",
                data: {
                    previousWalletBalance,
                    previousBankBalance,
                    newWalletBalance,
                    newBankBalance,
                    requestedAmount: amount,
                    actualTransferAmount: transferredAmount,
                }
            };

        });

        return res.status(200).json(result);

    } catch (error) {
        next(error);
    }
});

router.post("/bank-to-wallet/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const { amount } = req.body;

    // Validate input
    if (!amount || typeof amount !== "number") {
        throw new RequestError(400, "Invalid amount. Must be a valid number", {
            method: req.method, path: req.path
        });
    }

    try {
        const result = await withTransaction(async (t) => {
            const user = await findOneRecord(User, { where: { userId, guildId } });
            if (!user) {
                throw new CreateError(404, "User not found");
            }

            const userBank = await findOneRecord(UserBank, { where: { userId: userId } });
            const userWallet = await findOneRecord(UserWallet, { where: { userId: userId } });

            if (!userBank || !userWallet) {
                throw new CreateError(404, "User bank or wallet not found");
            }

            const previousWalletBalance = userWallet.balance;
            const previousBankBalance = userBank.balance;

            const { sourceBalance: newBankBalance, destinationBalance: newWalletBalance, transferredAmount } = transferMoney(userBank, userWallet, amount, 'toWallet');

            // Store transaction in database
            await sequelize.transaction(async (t) => {
                userBank.balance = newBankBalance;
                userWallet.balance = newWalletBalance;

                await userBank.save({ transaction: t });
                await userWallet.save({ transaction: t });
            });

            return {
                message: "Transfer from bank to wallet successful",
                data: {
                    previousWalletBalance,
                    previousBankBalance,
                    newWalletBalance,
                    newBankBalance,
                    requestedAmount: amount,
                    actualTransferAmount: transferredAmount,
                }
            };
        });

        return res.status(200).json(result);

    } catch (error) {
        next(error);
    }
});


router.post("/steal/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const { targetId } = req.body;

    if (!targetId) {
        throw new RequestError(400, "A target user is required", {
            method: req.method, path: req.path
        });
    }

    try {
        const result = await withTransaction(async (t) => {

            const [thiefUser, targetUser] = await Promise.all([
                findOneRecord(User, { where: { userId, guildId }, transaction: t }),
                findOneRecord(User, { where: { userId: targetId, guildId }, transaction: t })
            ]);


            if (!thiefUser || !targetUser) {
                throw new CreateError(404, "One or both users not found");
            }

            // Get wallets
            const thiefUserWallet = await findOneRecord(UserWallet, { where: { userId }, transaction: t });
            const targetUserWallet = await findOneRecord(UserWallet, { where: { userId: userId }, transaction: t });

            if (!thiefUserWallet || !targetUserWallet) {
                throw new CreateError(404, "Wallet not found for one or both users");
            }

            // Calculate steal amount (random 1-20% of target's wallet)
            const stealPercent = Math.random() * 0.19 + 0.01; // 1-20%
            const stealAmount = Math.floor(targetUserWallet.balance * stealPercent);

            if (stealAmount <= 0) {
                return { success: false, message: "Target doesn't have enough money to steal" };
            }

            // Transfer the money
            const { sourceBalance: newTargetBalance, destinationBalance: newStealerBalance, transferredAmount } =
                transferMoney(targetUserWallet, thiefUserWallet, stealAmount, 'toWallet');

            // Save changes
            targetUserWallet.balance = newTargetBalance;
            thiefUserWallet.balance = newStealerBalance;

            await targetUserWallet.save({ transaction: t });
            await thiefUserWallet.save({ transaction: t });

            return {
                success: true,
                stolen: transferredAmount,
                targetNewBalance: newTargetBalance,
                stealerNewBalance: newStealerBalance
            };
        });

        res.status(200).json(result);

    } catch (error) {
        next(error);
    }
});

module.exports = router;
