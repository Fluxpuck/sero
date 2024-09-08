const express = require("express");
const router = express.Router({ mergeParams: true });

const { sequelize } = require('../../database/sequelize');
const { Guild } = require("../../database/models");
const { findAllRecords, findOneRecord, createOrUpdateRecord } = require("../../utils/RequestManager");
const { CreateError, RequestError } = require("../../utils/ClassManager");

/**
 * GET api/guilds
 * @description Get all guilds
 * @param {string} limit - The number of guilds to return
 */
router.get("/", async (req, res, next) => {
    const { limit } = req.query;
    const options = { limit: limit || 100 };

    try {
        const guilds = await findAllRecords(Guild, options);
        if (!guilds) {
            throw new CreateError(404, "No guilds found");
        } else {
            res.status(200).json(guilds);
        }
    } catch (error) {
        next(error);
    }
});

/**
 * GET api/guilds/:guildId
 * @description Get a specific guild
 * @param {string} guildId - The id of the guild
 */
router.get("/:guildId", async (req, res, next) => {
    const { guildId } = req.params;
    const options = { where: { guildId: guildId } };

    try {
        const guild = await findOneRecord(Guild, options);
        if (!guild) {
            throw new CreateError(404, "Guild not found");
        } else {
            res.status(200).json(guild);
        }
    } catch (error) {
        next(error);
    }
});

/**
 * POST api/guilds
 * @description Create or update a guild
 * @param {string} guildId - The id of the guild
 * @param {string} guildName - The name of the guild
 * @param {boolean} active - The active status of the guild
 * @param {number} modifier - The modifier of the guild
 * @param {number} duration - The duration of the guild
 * @param {date} expireAt - The expireAt of the guild
 */
router.post("/", async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        const {
            guildId,
            guildName,
            active = true,
            modifier = 1,
            duration = null,
        } = req.body;

        // Check if the required fields are provided
        if (!guildId) {
            throw new RequestError(400, "Invalid Request", {
                method: req.method, path: req.path
            });
        }

        // Update or create the message
        const [result, created] = await createOrUpdateRecord(Guild, {
            guildId,
            guildName,
            active,
            modifier,
            duration
        }, t);

        // Commit the transaction
        await t.commit();

        // Send the appropriate response
        if (created) {
            res.status(201).json({ message: "Guild created successfully", data: result });
        } else {
            res.status(200).json({ message: "Guild updated successfully", data: result });
        };

    } catch (error) {
        t.rollback();
        next(error);
    }
});

/**
 * POST api/guilds/boost
 * @description Boost a guild
 * @param {string} guildId - The id of the guild
 * @param {number} modifier - The modifier of the guild
 * @param {number} duration - The duration of the guild
 */
router.post("/boost", async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        const {
            guildId,
            modifier = 1,
            duration = null,
        } = req.body;

        // Check if the required fields are provided
        if (!guildId) {
            throw new RequestError(400, "Invalid Request", {
                method: req.method, path: req.path
            });
        }

        // Check if the guild exists
        const options = { where: { guildId: guildId } };
        const guild = await findOneRecord(Guild, options);
        if (!guild) {
            throw new CreateError(404, "Guild not found");
        }

        // Update the guild with the new modifier and duration
        guild.modifier = modifier;
        guild.duration = duration;
        await guild.save({ transaction: t });

        // Commit the transaction
        await t.commit();

        // Send the appropriate response
        if (duration > 0) {
            res.status(201).json({ message: `Guild boost set successfully at ${modifier}x for ${duration}hours`, data: guild });
        } else {
            res.status(200).json({ message: "Guild boost removed successfully", data: guild });
        };

    } catch (error) {
        t.rollback();
        next(error);
    }
});

/**
 * DELETE api/guilds/:guildId
 * @description Deactivate a guild
 * @param {string} guildId - The id of the guild
 */
router.delete("/:guildId", async (req, res, next) => {
    const { guildId } = req.params;
    const options = { where: { guildId: guildId } };

    try {

        // Check if the guild exists
        const guild = await findOneRecord(UserBalance, options);
        if (!guild) {
            throw new CreateError(404, "Guild not found");
        }

        // Deactivate the guild
        guild.active = false;
        await guild.save({ transaction: t });

        // Commit the transaction
        await t.commit();

        // Send the appropriate response
        res.status(200).json({ message: "Guild deactivated successfully", data: result });

    } catch (error) {
        next(error);
    }
});

module.exports = router;