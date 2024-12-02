const express = require("express");
const router = express.Router({ mergeParams: true });

const { sequelize } = require('../../../../database/sequelize');
const { User, UserWallet, UserBank } = require("../../../../database/models");
const { findAllRecords, findOneRecord } = require("../../../../utils/RequestManager");
const { CreateError, RequestError } = require("../../../../utils/ClassManager");

/**
 * GET api/guilds/:guildId/balance
 * @description Get all guild users' bank and wallet balances
 * @param {string} guildId - The id of the guild
 */
router.get("/", async (req, res, next) => {
    const { guildId } = req.params;
    const options = {
        where: { guildId: guildId },
        include: [
            {
                model: UserWallet,
                required: false,
                where: { guildId: guildId }
            },
            {
                model: UserBank,
                required: false,
                where: { guildId: guildId }
            }
        ]
    };

    try {
        const usersData = await findAllRecords(User, options);
        if (!usersData || usersData.length === 0) {
            throw new CreateError(404, "No users found in the guild");
        }

        const responseData = usersData.map(user => ({
            userId: user.userId,
            userName: user.userName,
            guildId: user.guildId,
            wallet_balance: user.UserWallet?.balance || 0,
            bank_balance: user.UserBank?.balance || 0
        }));

        res.status(200).json(responseData);
    } catch (error) {
        next(error);
    }
});

/**
 * GET api/guilds/:guildId/balance/:userId
 * @description Get a specific guild user's bank and wallet balances
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 */
router.get("/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const options = {
        where: { guildId: guildId, userId: userId },
        include: [
            {
                model: UserWallet,
                required: false,
                where: { guildId: guildId, userId: userId }
            },
            {
                model: UserBank,
                required: false,
                where: { guildId: guildId, userId: userId }
            }
        ]
    };

    try {
        let userData = await findOneRecord(User, options);
        if (!userData) {
            throw new CreateError(404, "User not found in the guild");
        }

        if (!userData.user_wallets) {
            userData.UserWallet = await UserWallet.create({ guildId, userId, balance: 0 });

        }
        if (!userData.user_banks) {
            userData.UserBank = await UserBank.create({ guildId, userId, balance: 0 });
        }

        const responseData = {
            userId: userData.userId,
            guildId: userData.guildId,
            wallet_balance: userData.user_wallets[0].balance,
            bank_balance: userData.user_banks[0].balance
        };

        res.status(200).json(responseData);
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE api/guilds/:guildId/balance/:userId
 * @description Delete a specific guild user's bank and wallet balances
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 */
router.delete("/:userId", async (req, res, next) => {
    const t = await sequelize.transaction();
    const { guildId, userId } = req.params;
    const options = { where: { guildId: guildId, userId: userId } };

    try {
        const userWallet = await findOneRecord(UserWallet, options);
        const userBank = await findOneRecord(UserBank, options);

        if (!userWallet && !userBank) {
            throw new CreateError(404, "User balances not found in the guild");
        }

        if (userWallet) {
            await userWallet.destroy({ transaction: t });
        }
        if (userBank) {
            await userBank.destroy({ transaction: t });
        }

        await t.commit();
        res.status(200).json({ message: "User balances deleted successfully" });
    } catch (error) {
        await t.rollback();
        next(error);
    }
});

module.exports = router;