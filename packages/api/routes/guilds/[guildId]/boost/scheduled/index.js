const express = require("express");
const router = express.Router({ mergeParams: true });

const { Guild, ScheduledBoosts } = require("../../../../../database/models");
const { withTransaction, findAllRecords, findOneRecord, createOrUpdateRecord } = require("../../../../../utils/RequestManager");
const { CreateError, RequestError } = require("../../../../../utils/ClassManager");

/**
 * GET api/guilds/:guildId/boost/scheduled
 * @description Get all scheduled boosts for the guild
 * @param {string} guildId - The id of the guild
 */
router.get("/", async (req, res) => {
    const { guildId } = req.params;
    const options = { where: { guildId: guildId } };

    try {
        const scheduledBoosts = await findAllRecords(ScheduledBoosts, options);
        if (!scheduledBoosts) {
            throw new CreateError(404, "No logs were found for the user in the guild");
        } else {
            res.status(200).json(scheduledBoosts);
        }
    } catch (error) {
        res.status(500).json(new RequestError(error));
    }
});

/**
 * POST api/guilds/:guildId/boost/scheduled
 * @description Create a scheduled boost for the guild
 * @param {string} guildId - The id of the guild
 * @param {string} modifier - The boost modifier
 * @param {string} duration - The boost duration
 * @param {string} day - The day of the week to boost (0-6, Sunday-Saturday)
 * @param {string} time - The time of day to boost (24 hour using bot is UTC)
 * @param {string} repeat - Repeat the boost weekly
 * @param {string} eventId - The event id to reference
 */
router.post("/", async (req, res) => {
    const { guildId } = req.params;
    const { modifier, duration, day, time, repeat, eventId } = req.body;
    const options = { guildId, modifier, duration, day, time, repeat, eventId };

    try {
        const scheduledBoost = await createOrUpdateRecord(ScheduledBoosts, options);
        res.status(200).json(scheduledBoost);
    } catch (error) {
        res.status(500).json(new RequestError(error));
    }
});

/**
 * DELETE api/guilds/:guildId/boost/scheduled/:boostId
 * @description Delete a scheduled boost for the guild
 * @param {string} guildId - The id of the guild
 * @param {string} boostId - The id of the scheduled boost
 */
router.delete("/:boostId", async (req, res) => {
    const { guildId, boostId } = req.params;
    const options = { where: { guildId: guildId, id: boostId } }; // boostId's are unique across all servers technically

    try {
        const scheduledBoost = await findOneRecord(ScheduledBoosts, options);
        if (!scheduledBoost) {
            throw new CreateError(404, "Scheduled boost not found");
        }

        await scheduledBoost.destroy();
        res.status(200).json(scheduledBoost);
    } catch (error) {
        console.error(error)
        res.status(500).json(new RequestError(error));
    }
});

module.exports = router;