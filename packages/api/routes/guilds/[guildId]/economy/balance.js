const express = require("express");
const router = express.Router({ mergeParams: true });

const { sequelize } = require('../../../../database/sequelize');
const { User, UserWallet, UserBank } = require("../../../../database/models");
const { findAllRecords, findOneRecord } = require("../../../../utils/RequestManager");
const { CreateError, RequestError } = require("../../../../utils/ClassManager");

/**
 * GET api/guilds/:guildId/balance
 * @description Get all guild users balance
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
 * @description Get a specific guild user balance
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
        const userData = await findOneRecord(User, options);
        if (!userData) {
            throw new CreateError(404, "User not found in the guild");
        }

        const responseData = {
            userId: userData.userId,
            guildId: userData.guildId,
            wallet_balance: userData.UserWallet?.balance || 0,
            bank_balance: userData.UserBank?.balance || 0
        };

        res.status(200).json(responseData);
    } catch (error) {
        next(error);
    }
});


router.post("/wallet/:userId", async (req, res, next) => {
    const t = await sequelize.transaction();
    const { guildId, userId } = req.params;
    const options = { where: { guildId: guildId, userId: userId } };

    try {

        // Validate input
        if (!amount) {
            throw new RequestError(400, "Missing amount or type data. Please check and try again", {
                method: req.method, path: req.path
            });
        }

        let userBalance = await findOneRecord(UserWallet, options);
        if (!userBalance) {
            userBalance = await UserWallet.create({
                guildId: guildId,
                userId: userId,
            }, { transaction: t });
        }

        // Store previous balance
        const previousUserBalance = { ...userBalance.dataValues };

        // Update balance
        userBalance.balance = (userBalance.balance ?? 0) + amount;



    } catch (error) {
        t.rollback();
        next(error);
    }

});

router.post("/bank/:userId", async (req, res, next) => {
    const t = await sequelize.transaction();
    const { guildId, userId } = req.params;
    const options = { where: { guildId: guildId, userId: userId } };

    try {

        // Validate input
        if (!amount) {
            throw new RequestError(400, "Missing amount or type data. Please check and try again", {
                method: req.method, path: req.path
            });
        }




    } catch (error) {
        t.rollback();
        next(error);
    }
});








/**
 * POST api/guilds/:guildId/balance
 * @description Create user wallet or update a user balance in the guild
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 * @param {number} balance - The balance of the user
 */
router.post("/:userId", async (req, res, next) => {
    const t = await sequelize.transaction();
    const { guildId, userId } = req.params;
    const options = { where: { guildId: guildId, userId: userId } };

    try {
        const { amount, type = "wallet" } = req.body;

        // Validate input
        if (!amount || !type) {
            throw new RequestError(400, "Missing amount or type data. Please check and try again", {
                method: req.method, path: req.path
            });
        }

        // Validate type parameter
        if (!["wallet", "bank"].includes(type)) {
            throw new RequestError(400, "Invalid type. Must be 'wallet' or 'bank'", {
                method: req.method, path: req.path
            });
        }

        // Select correct model based on type
        const Model = type === "wallet" ? UserWallet : UserBank;

        let userBalance = await findOneRecord(Model, options);
        if (!userBalance) {
            userBalance = await Model.create({
                guildId: guildId,
                userId: userId,
                balance: 0
            }, { transaction: t });
        }

        // Store previous balance
        const previousUserBalance = { ...userBalance.dataValues };

        // Update balance
        userBalance.balance = (userBalance.balance ?? 0) + amount;

        // Balance constraints
        if (userBalance.balance < 0) {
            userBalance.balance = 0;
        } else if (userBalance.balance > 1_000_000_000) {
            userBalance.balance = 1_000_000_000;
        }

        // Save changes
        await userBalance.save({ transaction: t });

        const responseData = {
            message: amount < 0 ? `${-amount} coins removed from user's ${type}` : `${amount} coins added to user's ${type}`,
            previous: {
                userId: previousUserBalance.userId,
                guildId: previousUserBalance.guildId,
                [`${type}_balance`]: previousUserBalance.balance || 0
            },
            current: {
                userId: userBalance.userId,
                guildId: userBalance.guildId,
                [`${type}_balance`]: userBalance.balance
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
 * DELETE api/guilds/:guildId/balance/:userId
 * @description Delete a specific guild user balance
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 */
router.delete("/:userId", async (req, res, next) => {
    const t = await sequelize.transaction();
    const { guildId, userId } = req.params;
    const options = { where: { guildId: guildId, userId: userId } };

    try {
        const userBalance = await findOneRecord(UserWallet, options);
        if (!userBalance) {
            throw new CreateError(404, "User balance not found in the guild");
        } else {
            await userBalance.destroy({ transaction: t });
            await t.commit();
            res.status(200).json({ message: "User balance deleted successfully", data: userBalance });
        }
    } catch (error) {
        t.rollback();
        next(error);
    }
});

module.exports = router;