const express = require("express");
const router = express.Router({ mergeParams: true });

const { sequelize } = require('../../../../database/sequelize');
const { UserActivities } = require("../../../../database/models");
const { findAllRecords, findOneRecord, createOrUpdateRecord } = require("../../../../utils/RequestManager");
const { CreateError, RequestError } = require("../../../../utils/ClassManager");

const { Op } = require('sequelize');
const { startOfToday } = require('date-fns');
const startOfDay = startOfToday();

/**
 * GET api/guilds/:guildId/activities
 * @description Get all guild activities
 * @param {string} limit - The number of activities to return
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 */
router.get("/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const { limit = 20, today = true, type = "transfer-exp" } = req.query;

    const options = { where: { guildId: guildId, userId: userId, type: type }, limit: limit };
    if (today === true) {
        options.where.createdAt = { [Op.gte]: startOfDay };
    }

    try {
        const userActivitiesData = await findAllRecords(UserActivities, options);
        if (!userActivitiesData) {
            throw new CreateError(404, "User not away in the guild");
        } else {

            let totalAmount = 0

            for (const activity of userActivitiesData) {
                const { targetId, amount } = activity.additional;
                totalAmount += amount;
            }

            res.status(200).json({ activities: userActivitiesData, totalAmount });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;