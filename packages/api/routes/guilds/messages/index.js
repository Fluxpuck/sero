const express = require("express");
const router = express.Router({ mergeParams: true });

const { Messages } = require("../../../database/models");
const { findAllRecords, findOneRecord, createOrUpdateRecord } = require("../../../utils/RequestManager");

/**
 * GET api/guilds/:guildId/messages
 * @description Get all guild messages
 * @param {string} limit - The number of messages to return
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 */
router.get("/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const { limit } = req.query;
    const options = { limit: limit || 1000, where: { guildId: guildId, userId: userId } };

    try {
        const guildMessages = await findAllRecords(Messages, options);
        if (!guildMessages) {
            throw new CreateError(404, "No messages were found for the user in the guild");
        } else {
            res.status(200).json(guildMessages);
        }
    } catch (error) {
        next(error);
    }
});

/**
 * GET api/guilds/:guildId/messages/:messageId
 * @description Get a specific guild message
 * @param {string} guildId - The id of the guild
 * @param {string} messageId - The id of the message
 * @param {string} userId - The id of the user
 * @param {string} channelId - The id of the channel
 */
router.post("/", async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const {
            guildId
        } = req.params;
        const {
            messageId,
            channelId,
            userId,
        } = req.body;

        // Check if the required fields are provided
        if (!messageId || !channelId || !userId) {
            throw new RequestError(400, "Invalid Request", {
                method: req.method, path: req.path
            });
        }

        // Update or create the message
        const message = await createOrUpdateRecord(Messages, { messageId, channelId, userId, guildId }, t);

        // Commit the transaction
        await t.commit();

        // Send the response
        res.status(200).json({ message: "Message stored successfully", data: message });

    } catch (error) {
        t.rollback();
        next(error);
    }
});

module.exports = router;