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

router.post("/", async (req, res, next) => {
    const t = await sequelize.transaction();

    try {
        const {
            commandId = null,
            commandName,
            description = null,
            usage = null,
            interactionType,
            interactionOptions = null,
            defaultMemberPermissions = null,
        } = req.body;


    } catch (error) {
        t.rollback();
        next(error);
    }
});



module.exports = router;