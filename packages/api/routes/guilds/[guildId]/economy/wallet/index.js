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
 * @description Update a specific guild user's wallet balance
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
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

        // Update balance
        userWallet.balance = (userWallet.balance ?? 0) + amount;

        // Balance constraints
        if (userWallet.balance < 0) {
            userWallet.balance = 0;
        } else if (userWallet.balance > 1_000_000_000) {
            userWallet.balance = 1_000_000_000;
        }

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
