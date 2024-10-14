const express = require("express");
const router = express.Router({ mergeParams: true });

const { sequelize } = require('../../../../database/sequelize');
const { UserActivities } = require("../../../../database/models");
const { findAllRecords, createUniqueRecord, findOneRecord } = require("../../../../utils/RequestManager");
const { CreateError, RequestError } = require("../../../../utils/ClassManager");

/**
 * GET api/guilds/:guildId/activities/calculate
 * @description Get all guild activities
 * @param {string} limit - The number of activities to return
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 * @param {string} type - The type of activity
 */
router.get("/:userId/:type", async (req, res, next) => {
    const { guildId, userId, type } = req.params;
    const { totalType = "amount" } = req.query;
    const options = { where: { guildId: guildId, userId: userId, type: type } };

    try {
        const userActivitiesData = await findAllRecords(UserActivities, options);
        if (!userActivitiesData || userActivitiesData.length === 0) {
            throw new CreateError(404, "No activities found for the user in the guild");
        }

        // Calculate total based on totalType
        const total = userActivitiesData.reduce((sum, activity) => {
            return sum + (activity.additional[totalType] || 0);
        }, 0);

        res.status(200).json({ total });
    } catch (error) {
        next(error);
    }
});




module.exports = router;