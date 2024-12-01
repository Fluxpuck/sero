const express = require("express");
const router = express.Router({ mergeParams: true });

const { UserBank } = require("../../../../../database/models");
const { withTransaction, findOneRecord } = require("../../../../../utils/RequestManager");
const { CreateError, RequestError } = require("../../../../../utils/ClassManager");

/**
 * POST api/guilds/:guildId/economy/bank/:userId
 * @description Create or update a user's bank balance in the guild
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 * @param {number} amount - The amount to deposit or withdraw from the bank
 */
router.post("/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const { amount, allowNegative = true } = req.body;

    if (!amount || typeof amount !== "number") {
        throw new RequestError(400, "Invalid amount. Must be a valid number", {
            method: req.method, path: req.path
        });
    }

    try {
        const result = await withTransaction(async (t) => {
            let userBank = await findOneRecord(UserBank, {
                where: { guildId, userId }
            });

            if (!userBank) {
                userBank = await UserBank.create({
                    guildId,
                    userId,
                    balance: 0
                }, { transaction: t });
            }

            const previousBalance = userBank.balance ?? 0;
            let newBalance = previousBalance + amount;

            if (!allowNegative && newBalance < 0) {
                newBalance = 0;
            }

            if (newBalance < UserBank.MINIMUM_BALANCE) {
                throw new CreateError(400, `Bank balance cannot be less than ${UserBank.MINIMUM_BALANCE}`);
            }

            if (newBalance > UserBank.MAXIMUM_BALANCE) {
                throw new CreateError(400, `Bank balance cannot exceed ${UserBank.MAXIMUM_BALANCE}`);
            }

            userBank.balance = newBalance;
            await userBank.save({ transaction: t });

            return {
                message: `Successfully ${amount < 0 ? 'withdrawn' : 'deposited'} ${Math.abs(amount)} coins`,
                transaction: {
                    userId,
                    guildId,
                    currentBalance: newBalance,
                    amount,
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
            const userBank = await findOneRecord(UserBank, {
                where: { guildId, userId }
            });

            if (!userBank) {
                throw new CreateError(404, "User bank entry not found");
            }

            await userBank.destroy({ transaction: t });
            return { message: "User wallet entry deleted successfully", data: userBank };
        });

        res.status(200).json(result);

    } catch (error) {
        next(error);
    }
});

module.exports = router;
