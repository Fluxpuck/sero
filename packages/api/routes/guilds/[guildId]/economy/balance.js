const express = require("express");
const router = express.Router({ mergeParams: true });

const { sequelize } = require('../../../../database/sequelize');
const { User, UserBalance } = require("../../../../database/models");
const { findAllRecords, findOneRecord, createOrUpdateRecord } = require("../../../../utils/RequestManager");
const { CreateError, RequestError } = require("../../../../utils/ClassManager");

/**
 * GET api/guilds/:guildId/balance
 * @description Get all guild users balance
 * @param {string} guildId - The id of the guild
 */
router.get("/", async (req, res, next) => {
    const { guildId } = req.params;
    const { limit } = req.query;
    const options = {
        limit: limit || 100,
        where: { guildId: guildId },
        order: [['balance', 'DESC']],
        include: [{
            model: User,
            where: { guildId: guildId }
        }],
    };

    try {
        const userBalances = await findAllRecords(UserBalance, options);
        if (!userBalances) {
            throw new CreateError(404, "No users balances were found in the guild");
        } else {
            res.status(200).json(userBalances);
        }
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
    const options = { where: { guildId: guildId, userId: userId } };

    try {
        const userBalance = await findOneRecord(UserBalance, options);
        if (!userBalance) {
            throw new CreateError(404, "User balance not found in the guild");
        } else {
            res.status(200).json(userBalance);
        }
    } catch (error) {
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
router.post("/", async (req, res, next) => {
    const t = await sequelize.transaction();
    const { guildId } = req.params;

    try {
        const {
            userId,
            balance = 0,
        } = req.body;

        // Check if the required fields are provided
        if (!userId) {
            throw new RequestError(400, "Invalid Request", {
                method: req.method, path: req.path
            });
        }

        // Find the existing balance for the user
        const options = { where: { guildId: guildId, userId: userId } };
        const existingBalance = await findOneRecord(UserBalance, options);

        // Calculate the new balance
        let newBalance = existingBalance ? existingBalance.balance + balance : balance;
        newBalance = newBalance < 0 ? 0 : newBalance;

        // Update or create the balance
        const [result, created] = await createOrUpdateRecord(UserBalance, { guildId, userId, balance: newBalance }, t);

        // Send the appropriate response
        if (created) {
            res.status(201).json({ message: "User balance created successfully", data: result });
        } else {
            res.status(200).json({ message: "User balance updated successfully", data: result });
        };

        // Commit the transaction
        await t.commit();

    } catch (error) {
        t.rollback();
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
        const userBalance = await findOneRecord(UserBalance, options);
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