const express = require("express");
const router = express.Router({ mergeParams: true });

const { sequelize } = require('../../../../database/sequelize');
const { User, UserWallet, UserBank } = require("../../../../database/models");
const { findAllRecords, findOneRecord } = require("../../../../utils/RequestManager");
const { CreateError, RequestError } = require("../../../../utils/ClassManager");

const BALANCE_LIMIT = 0;

router.post("/wallet-to-bank/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const { amount } = req.body;

    // Validate input
    if (!amount && typeof amount !== "number") {
        throw new RequestError(400, "Invalid amount. Must be a valid number", {
            method: req.method, path: req.path
        });
    }

    try {
        const user = await findOneRecord(User, { where: { userId, guildId } });
        if (!user) {
            throw new CreateError(404, "User not found");
        }

        const userBank = await findOneRecord(UserBank, { where: { userId: userId } });
        const userWallet = await findOneRecord(UserWallet, { where: { userId: userId } });

        if (!userBank || !userWallet) {
            throw new CreateError(404, "User bank or wallet not found");
        }

        let actualTransferAmount = amount;
        const previousWalletBalance = userWallet.balance;
        const previousBankBalance = userBank.balance;
        let newWalletBalance = userWallet.balance - amount;
        let newBankBalance = userBank.balance + amount;

        // Check if transfer would result in balance below minimum
        if (newWalletBalance < BALANCE_LIMIT) {
            newWalletBalance = BALANCE_LIMIT;
            actualTransferAmount = newWalletBalance - previousWalletBalance;
            newBankBalance = userBank.balance += actualTransferAmount;
        }

        //  Check if transfer would result in balance above maximum
        if (newBankBalance > BALANCE_LIMIT) {
            newBankBalance = BALANCE_LIMIT;
            actualTransferAmount = newBankBalance - previousBankBalance;
            newWalletBalance = userWallet.balance + actualTransferAmount;
        }


        // Store transaction in database
        await sequelize.transaction(async (t) => {
            userWallet.balance = newWalletBalance;
            userBank.balance = newBankBalance;

            await userWallet.save({ transaction: t });
            await userBank.save({ transaction: t });
        });

        res.status(200).json({
            message: "Transfer from wallet to bank successful",
            transaction: {
                previousWalletBalance,
                previousBankBalance,
                newWalletBalance,
                newBankBalance,
                requestedAmount: amount,
                actualTransferAmount,
            }
        });
    } catch (error) {
        next(error);
    }
});

router.post("/bank-to-wallet/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const { amount } = req.body;

    // Validate input
    if (!amount && typeof amount !== "number") {
        throw new RequestError(400, "Invalid amount. Must be a valid number", {
            method: req.method, path: req.path
        });
    }

    try {

        const user = await findOneRecord(User, { where: { userId, guildId } });
        if (!user) {
            throw new CreateError(404, "User not found");
        }

        const userBank = await findOneRecord(UserBank, { where: { userId: userId } });
        const userWallet = await findOneRecord(UserWallet, { where: { userId: userId } });

        if (!userBank || !userWallet) {
            throw new CreateError(404, "User bank or wallet not found");
        }

        let actualTransferAmount = amount;
        const previousWalletBalance = userWallet.balance;
        const previousBankBalance = userBank.balance;
        let newWalletBalance = userWallet.balance + amount;
        let newBankBalance = userBank.balance - amount;

        // Check if transfer would result in balance below minimum
        if (newBankBalance < UserBank.MINIMUM_BALANCE) {
            newBankBalance = UserBank.MINIMUM_BALANCE;
            actualTransferAmount = newBankBalance - previousBankBalance;
            newWalletBalance = userWallet.balance + actualTransferAmount;
        }

        //  Check if transfer would result in balance above maximum
        if (newWalletBalance > UserWallet.MAXIMUM_BALANCE) {
            newWalletBalance = UserWallet.MAXIMUM_BALANCE;
            actualTransferAmount = newWalletBalance - previousWalletBalance;
            newBankBalance = userBank.balance - actualTransferAmount;
        }

        // Store transaction in database
        await sequelize.transaction(async (t) => {
            userWallet.balance = newWalletBalance;
            userBank.balance = newBankBalance;

            await userWallet.save({ transaction: t });
            await userBank.save({ transaction: t });
        });

        res.status(200).json({
            message: "Transfer from bank to wallet successful",
            transaction: {
                previousWalletBalance,
                previousBankBalance,
                newWalletBalance,
                newBankBalance,
                requestedAmount: amount,
                actualTransferAmount,
            }
        });


    } catch (error) {
        next(error);
    }
});

module.exports = router;
