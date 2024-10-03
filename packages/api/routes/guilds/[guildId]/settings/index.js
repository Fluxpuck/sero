const express = require("express");
const router = express.Router({ mergeParams: true });

const { sequelize } = require('../../../../database/sequelize');
const { GuildSettings } = require("../../../../database/models");
const { findAllRecords, createUniqueRecord, findOneRecord } = require("../../../../utils/RequestManager");
const { CreateError, RequestError } = require("../../../../utils/ClassManager");

/**
 * GET api/guilds/:guildId/settings
 * @description Get all guild settings
 * @param {string} guildId - The id of the guild
 */
router.get("/", async (req, res, next) => {
    const { guildId } = req.params;
    const options = { where: { guildId: guildId } };

    try {
        const guildSettings = await findAllRecords(GuildSettings, options);
        if (!guildSettings) {
            throw new CreateError(404, "No settings were found for the guild");
        } else {
            res.status(200).json(guildSettings);
        }
    } catch (error) {
        next(error);
    }
});

/**
 * GET api/guilds/:guildId/settings/:type
 * @description Get a specific guild setting
 * @param {string} guildId - The id of the guild
 * @param {string} type - The type of the setting
 */
router.get("/:type", async (req, res, next) => {
    const { guildId, type } = req.params;
    const options = { where: { guildId: guildId, type: type } };

    try {
        const guildSettings = await findOneRecord(GuildSettings, options);
        if (!guildSettings) {
            throw new CreateError(404, "No settings were found for the guild");
        } else {
            res.status(200).json(guildSettings);
        }
    } catch (error) {
        next(error);
    }
});

/**
 * POST api/guilds/:guildId/settings
 * @description Create or update a guild setting
 * @param {string} guildId - The id of the guild
 * @param {string} type - The type of the setting
 * @param {string} channelId - The id of the channel
 */
router.post("/", async (req, res, next) => {
    const t = await sequelize.transaction();
    const { guildId } = req.params;

    try {
        const {
            type,
            channelId,
            exclude = []
        } = req.body;

        // Check if the required fields are provided
        if (!type || !channelId) {
            throw new RequestError(400, "Missing required data. Please check and try again", {
                method: req.method, path: req.path
            });
        }

        // Update or create the setting
        const setting = await createUniqueRecord(GuildSettings, { guildId, type, channelId, exclude }, t);

        // Send the response
        res.status(200).json({ message: "Guild setting stored successfully", data: setting });

        // Commit the transaction
        await t.commit();

    } catch (error) {
        t.rollback();
        next(error);
    }
});

module.exports = router;