const express = require("express");
const router = express.Router({ mergeParams: true });

const { sequelize } = require('../../../../database/sequelize');
const { User } = require("../../../../database/models");
const { findAllRecords, findOneRecord, createOrUpdateRecord } = require("../../../../utils/RequestManager");
const { CreateError, RequestError } = require("../../../../utils/ClassManager");

/**
 * GET api/guilds/:guildId/users
 * @description Get all guild users
 * @param {string} limit - The number of users to return
 * @param {string} guildId - The id of the guild
 */
router.get("/", async (req, res, next) => {
    const { guildId } = req.params;
    const { limit } = req.query;
    const options = { limit: limit || 100, where: { guildId: guildId } };

    try {
        const guildUsers = await findAllRecords(User, options);
        if (!guildUsers) {
            throw new CreateError(404, "No users were found in the guild");
        } else {
            res.status(200).json(guildUsers);
        }
    } catch (error) {
        next(error);
    }
});

/**
 * GET api/guilds/:guildId/users/:userId
 * @description Get a specific guild user
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 */
router.get("/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const options = { where: { guildId: guildId, userId: userId } };

    try {
        const guildUser = await findOneRecord(User, options);
        if (!guildUser) {
            throw new CreateError(404, "User not found in the guild");
        } else {
            res.status(200).json(guildUser);
        }
    } catch (error) {
        next(error);
    }
});

/**
 * POST api/guilds/:guildId/users
 * @description Create or update a guild user
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 * @param {string} userName - The name of the user
 * @param {boolean} moderator - The moderator status of the user
 * @param {boolean} active - The active status of the user
 */
router.post("/", async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const {
            guildId
        } = req.params;
        const {
            userId,
            userName,
            moderator = false,
            active = true
        } = req.body;

        // Check if the required fields are provided
        if (!userId || !userName) {
            throw new RequestError(400, "Invalid Request", {
                method: req.method, path: req.path
            });
        }

        // Update or Create the record
        const [result, created] = await createOrUpdateRecord(User, {
            guildId,
            userId,
            userName,
            moderator,
            active
        }, t);

        // Send the appropriate response
        if (created) {
            res.status(201).json({ message: "User created successfully", user: result });
        } else {
            res.status(200).json({ message: "User updated successfully", user: result });
        };

        // Commit the transaction
        await t.commit();

    } catch (error) {
        t.rollback();
        next(error);
    }

    /**
     * DELETE api/guilds/:guildId/users/:userId
     * @description Delete a specific guild user
     * @param {string} guildId - The id of the guild
     * @param {string} userId - The id of the user
     */
    router.delete("/:userId", async (req, res, next) => {
        const { guildId, userId } = req.params;
        const options = { where: { guildId: guildId, userId: userId } };

        try {
            const guildUser = await findOneRecord(User, options);
            if (!guildUser) {
                throw new CreateError(404, "User not found in the guild");
            } else {
                await guildUser.destroy();
                res.status(200).json({ message: "User deleted successfully" });
            }
        } catch (error) {
            next(error);
        }
    });

});

module.exports = router;