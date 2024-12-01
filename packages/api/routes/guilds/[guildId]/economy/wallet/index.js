const express = require("express");
const router = express.Router({ mergeParams: true });

const { UserWallet } = require("../../../../../database/models");
const { withTransaction, findOneRecord } = require("../../../../../utils/RequestManager");
const { CreateError, RequestError } = require("../../../../../utils/ClassManager");

/**
 * POST api/guilds/:guildId/economy/wallet/:userId
 * @description Create or update a user's wallet balance in the guild
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 * @param {number} amount - The amount to deposit or withdraw from the wallet
 */
router.post("/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const { amount, allowNegative = false } = req.body;

    // Validate input
    if (!amount && typeof amount !== "number") {
        throw new RequestError(400, "Invalid amount. Must be a valid number", {
            method: req.method, path: req.path
        });
    }

    try {
        const result = await withTransaction(async (t) => {
            let userWallet = await findOneRecord(UserWallet, {
                where: { guildId, userId }
            });

            if (!userWallet) {
                userWallet = await UserWallet.create({
                    guildId,
                    userId,
                    balance: 0
                }, { transaction: t });
            }

            const previousBalance = userWallet.balance ?? 0;
            let newBalance = previousBalance + amount;

            if (!allowNegative && newBalance < 0) {
                newBalance = 0;
            }

            if (newBalance < UserWallet.MINIMUM_BALANCE) {
                throw new CreateError(400, `Wallet balance cannot be less than ${userWallet.MINIMUM_BALANCE}`);
            }

            if (newBalance > UserWallet.MAXIMUM_BALANCE) {
                throw new CreateError(400, `Wallet balance cannot exceed ${userWallet.MAXIMUM_BALANCE}`);
            }

            userWallet.balance = newBalance;
            await userWallet.save({ transaction: t });

            return {
                message: `Successfully ${amount < 0 ? 'withdrawn' : 'deposited'} ${Math.abs(amount)} coins`,
                transaction: {
                    userId,
                    guildId,
                    currentBalance: newBalance,
                    amount,
                    trueAmount: previousBalance - newBalance,
                    type: amount < 0 ? 'withdrawal' : 'deposit',
                    timestamp: new Date().toISOString()
                },
                previous: {
                    userId,
                    guildId,
                    balance: previousBalance
                }
            };
        });

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE api/guilds/:guildId/economy/wallet/:userId
 * @description Delete a specific guild user's wallet balance
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 */
router.delete("/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;

    try {
        const result = await withTransaction(async (t) => {
            const userWallet = await findOneRecord(UserWallet, {
                where: { guildId, userId }
            });

            if (!userWallet) {
                throw new CreateError(404, "User wallet entry not found");
            }

            await userWallet.destroy({ transaction: t });
            return { message: "User wallet entry deleted successfully", data: userWallet };
        });

        res.status(200).json(result);

    } catch (error) {
        next(error);
    }
});

module.exports = router;
