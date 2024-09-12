const express = require("express");
const router = express.Router({ mergeParams: true });

const { sequelize } = require('../../database/sequelize');
const { GuildSettings } = require("../../database/models");
const { findAllRecords, findOneRecord, createOrUpdateRecord } = require("../../utils/RequestManager");
const { CreateError, RequestError } = require("../../utils/ClassManager");

/**
 * GET api/guilds/drops/:type
 * @description Get a specific guild setting
 * @param {string} type - The type of the setting
 */
router.get("/:type", async (req, res, next) => {
    const { type } = req.params;
    const options = { where: { type: type } };

    try {
        const guildSettings = await findAllRecords(GuildSettings, options);
        if (!guildSettings) {
            throw new CreateError(404, "No guild settings were found for this type");
        } else {
            res.status(200).json(guildSettings);
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;