const express = require("express");
const { Sequelize } = require('sequelize');
const router = express.Router({ mergeParams: true });
const { subMinutes } = require('date-fns');

const { sequelize } = require('../../../../database/sequelize');
const { Messages } = require("../../../../database/models");
const { findAllRecords } = require("../../../../utils/RequestManager");
const { CreateError } = require("../../../../utils/ClassManager");

/**
 * GET api/guilds/:guildId/messages/active
 * @description Get all messages for the user in the guild from the last X minutes
 * @param {string} time - The number of minutes to look back
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 */
router.get("/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const { time = 5 } = req.query; // Default time to 5 minutes if not provided

    // Calculate the date and time X minutes ago
    const timeAgo = subMinutes(new Date(), parseInt(time, 10));

    const options = {
        where: {
            guildId: guildId,
            userId: userId,
            createdAt: {
                [Sequelize.Op.gte]: timeAgo
            }
        },
        limit: 10
    };

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

module.exports = router;