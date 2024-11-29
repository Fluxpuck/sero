const express = require("express");
const router = express.Router({ mergeParams: true });

const { sequelize } = require('../../../../../database/sequelize');
const { UserWallet } = require("../../../../../database/models");
const { findOneRecord } = require("../../../../../utils/RequestManager");
const { CreateError, RequestError } = require("../../../../../utils/ClassManager");

/**
 * GET api/guilds/:guildId/economy/wallet/:userId
 * @description Get a specific guild user's wallet balance
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 */
router.get("/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const options = { where: { guildId: guildId, userId: userId } };

    try {
        const userWallet = await findOneRecord(UserWallet, options);
        if (!userWallet) {
            throw new CreateError(404, "User wallet not found in the guild");
        }

        const responseData = {
            userId: userWallet.userId,
            guildId: userWallet.guildId,
            wallet_balance: userWallet.balance || 0
        };

        res.status(200).json(responseData);
    } catch (error) {
        next(error);
    }
});

/**
 * POST api/guilds/:guildId/economy/wallet/:userId
 * @description Create or update a user's wallet balance in the guild
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

        let userWallet = await findOneRecord(UserWallet, options);
        if (!userWallet) {
            userWallet = await UserWallet.create({
                guildId: guildId,
                userId: userId,
                balance: 0
            }, { transaction: t });
        }

        // Store previous balance
        const previousUserWallet = { ...userWallet.dataValues };

        // Update balance with validation
        const newBalance = (userWallet.balance ?? 0) + amount;

        // Check minimum balance constraint
        if (newBalance < 0) {
            throw new RequestError(400, "Wallet balance cannot be less than empty", {
                method: req.method,
                path: req.path
            });
        }

        // Check maximum balance constraint
        if (newBalance > 10_000) {
            throw new RequestError(400, "Wallet can not hold more than 10,000", {
                method: req.method,
                path: req.path
            });
        }

        userWallet.balance = newBalance;

        // Save changes
        await userWallet.save({ transaction: t });

        const responseData = {
            message: amount < 0 ? `${-amount} coins removed from user's wallet` : `${amount} coins added to user's wallet`,
            previous: {
                userId: previousUserWallet.userId,
                guildId: previousUserWallet.guildId,
                wallet_balance: previousUserWallet.balance || 0
            },
            current: {
                userId: userWallet.userId,
                guildId: userWallet.guildId,
                wallet_balance: userWallet.balance
            }
        };

        await t.commit();
        res.status(200).json(responseData);

    } catch (error) {
        await t.rollback();
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
    const t = await sequelize.transaction();
    const { guildId, userId } = req.params;
    const options = { where: { guildId: guildId, userId: userId } };

    try {
        const userWallet = await findOneRecord(UserWallet, options);
        if (!userWallet) {
            throw new CreateError(404, "User wallet not found in the guild");
        } else {
            await userWallet.destroy({ transaction: t });
            await t.commit();
            res.status(200).json({ message: "User wallet deleted successfully", data: userWallet });
        }
    } catch (error) {
        t.rollback();
        next(error);
    }
});

module.exports = router;
