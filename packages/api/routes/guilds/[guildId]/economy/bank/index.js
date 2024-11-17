const express = require("express");
const router = express.Router({ mergeParams: true });

const { sequelize } = require('../../../../../database/sequelize');
const { UserBank } = require("../../../../../database/models");
const { findOneRecord } = require("../../../../../utils/RequestManager");
const { CreateError, RequestError } = require("../../../../../utils/ClassManager");

/**
 * POST api/guilds/:guildId/economy/bank/:userId
 * @description Create or update a user's bank balance in the guild
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 * @param {number} balance - The balance of the user
 */
router.post("/:userId", async (req, res, next) => {
    const t = await sequelize.transaction();
    const { guildId, userId } = req.params;
    const { amount } = req.body;
    const options = { where: { guildId: guildId, userId: userId } };

    try {
        // Validate input
        if (!amount) {
            throw new RequestError(400, "Missing amount data. Please check and try again", {
                method: req.method, path: req.path
            });
        }

        let userBank = await findOneRecord(UserBank, options);
        if (!userBank) {
            userBank = await UserBank.create({
                guildId: guildId,
                userId: userId,
                balance: 0
            }, { transaction: t });
        }

        // Store previous balance
        const previousUserBank = { ...userBank.dataValues };

        // Update balance
        userBank.balance = (userBank.balance ?? 0) + amount;

        // Balance constraints
        if (userBank.balance < 0) {
            userBank.balance = 0;
        } else if (userBank.balance > 1_000_000_000) {
            userBank.balance = 1_000_000_000;
        }

        // Save changes
        await userBank.save({ transaction: t });

        const responseData = {
            message: amount < 0 ? `${-amount} coins removed from user's bank` : `${amount} coins added to user's bank`,
            previous: {
                userId: previousUserBank.userId,
                guildId: previousUserBank.guildId,
                bank_balance: previousUserBank.balance || 0
            },
            current: {
                userId: userBank.userId,
                guildId: userBank.guildId,
                bank_balance: userBank.balance
            }
        };

        await t.commit();
        res.status(200).json(responseData);

    } catch (error) {
        await t.rollback();
        next(error);
    }
});

module.exports = router;
