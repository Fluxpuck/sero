const express = require("express");
const router = express.Router({ mergeParams: true });

const { Guild } = require("../../database/models");
const { withTransaction, findAllRecords, findOneRecord, createOrUpdateRecord } = require("../../utils/RequestManager");
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
 */
router.post("/", async (req, res, next) => {
    const { guildId, guildName } = req.body;

    if (!guildId || !guildName) {
        throw new RequestError(400, "Missing required fields: guildId and guildName are required", {
            method: req.method,
            path: req.path,
        });
    }

    try {
        const result = await withTransaction(async (t) => {

            const [result, created] = await createOrUpdateRecord(Guild, {
                guildId,
                guildName,
            }, t);

            return {
                message: created ? "Guild created successfully" : "Guild updated successfully",
                data: result,
            };

        });

        res.status(200).json(result);
    } catch (error) {
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
    const { guildId, modifier = 1, duration = null } = req.body;

    // Check if the required fields are provided
    if (!guildId) {
        throw new RequestError(400, "Missing required data. Please check and try again", {
            method: req.method, path: req.path
        });
    }

    try {
        const result = await withTransaction(async (t) => {

            const guild = await findOneRecord(Guild, { where: { guildId: guildId } });
            if (!guild) {
                throw new CreateError(404, "Guild not found");
            }

            // Update the guild with the new modifier and duration
            guild.modifier = modifier;
            guild.duration = duration;

            await guild.save({ transaction: t });

            return {
                message: duration > 0 ? `Guild boost set successfully at ${modifier}x for ${duration} hours` : "Guild boost removed successfully",
                data: guild,
            }

        });

        res.status(201).json(result);
    } catch (error) {
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

    try {
        const result = await withTransaction(async (t) => {

            const guild = await findOneRecord(Guild, { where: { guildId: guildId } });
            if (!guild) {
                throw new CreateError(404, "Guild not found");
            }

            await guild.save({ transaction: t });

            return { message: "Guild deactivated successfully", data: result };
        });

        res.status(200).json(result);

    } catch (error) {
        next(error);
    }
});

module.exports = router;