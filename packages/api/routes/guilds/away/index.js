const express = require("express");
const router = express.Router({ mergeParams: true });

const { Away } = require("../../../database/models");
const { findAllRecords, findOneRecord, createOrUpdateRecord } = require("../../../utils/RequestManager");

/**
 * GET api/guilds/:guildId/away
 * @description Get all guild away users
 * @param {string} limit - The number of away users to return
 * @param {string} guildId - The id of the guild
 */
router.get("/", async (req, res, next) => {
    const { guildId } = req.params;
    const { limit } = req.query;
    const options = { limit: limit || 100, where: { guildId: guildId } };

    try {
        const guildAways = await findAllRecords(Away, options);
        if (!guildAways) {
            throw new CreateError(404, "No users are away in the guild");
        } else {
            res.status(200).json(guildAways);
        }
    } catch (error) {
        next(error);
    }
});

/**
 * GET api/guilds/:guildId/away/:userId
 * @description Get a specific guild away user
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 */
router.get("/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const options = { where: { guildId: guildId, userId: userId } };

    try {
        const guildAway = await findOneRecord(Away, options);
        if (!guildAway) {
            throw new CreateError(404, "User not away in the guild");
        } else {
            res.status(200).json(guildAway);
        }
    } catch (error) {
        next(error);
    }
});

/**
 * POST api/guilds/:guildId/away
 * @description Create or update a guild away user
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 * @param {string} duration - The duration of the away
 * @param {string} message - The message of the away
 */
router.post("/", async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const {
            guildId
        } = req.params;
        const {
            userId,
            duration,
            message = null,
        } = req.body;

        // Check if the required fields are provided
        if (!userId || !duration) {
            throw new RequestError(400, "Invalid Request", {
                method: req.method, path: req.path
            });
        }

        // Update or create the away
        const [result, created] = await createOrUpdateRecord(Away, { userId, guildId, duration, message }, t);

        // Commit the transaction
        await t.commit();

        // Send the appropriate response
        if (created) {
            res.status(201).json({ message: "User away status created successfully", data: result });
        } else {
            res.status(200).json({ message: "User away status updated successfully", data: result });
        };

    } catch (error) {
        t.rollback();
        next(error);
    }
});

/**
 * DELETE api/guilds/:guildId/away/:userId
 * @description Delete a specific guild away user
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 */
router.delete("/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const options = { where: { guildId: guildId, userId: userId } };

    try {
        const guildAway = await findOneRecord(Away, options);
        if (!guildAway) {
            throw new CreateError(404, "User not away in the guild");
        } else {
            await guildAway.destroy();
            res.status(200).json({ message: "User away status deleted successfully", data: guildAway });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;