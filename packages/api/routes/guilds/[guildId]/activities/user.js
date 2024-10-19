const express = require("express");
const router = express.Router({ mergeParams: true });

const { UserActivities } = require("../../../../database/models");
const { findAllRecords } = require("../../../../utils/RequestManager");
const { CreateError } = require("../../../../utils/ClassManager");

const { Op } = require('sequelize');
const { startOfToday, endOfToday } = require('date-fns');

// Helper function to fetch user activities
const fetchUserActivities = async (options, res, next) => {
    try {
        const userActivitiesData = await findAllRecords(UserActivities, options);
        if (!userActivitiesData || userActivitiesData.length === 0) {
            throw new CreateError(404, "No activities found for the user");
        }
        res.status(200).json(userActivitiesData);
    } catch (error) {
        next(error);
    }
};

/**
 * GET api/guilds/:guildId/activities
 * @description Get all guild activities
 * @param {string} limit - The number of activities to return
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 */
router.get("/:userId", (req, res, next) => {
    const { guildId, userId } = req.params;
    const { limit } = req.query;
    const options = { where: { guildId, userId }, limit: limit || 20 };
    fetchUserActivities(options, res, next);
});

/**
 * GET api/guilds/:guildId/activities/:userId/:type
 * @description Get all guild activities
 * @param {string} limit - The number of activities to return
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 * @param {string} type - The type of activity
 */
router.get("/:userId/:type", (req, res, next) => {
    const startOfDay = startOfToday();
    const endOfDay = endOfToday();

    const { guildId, userId, type } = req.params;
    const { limit = 10, today = "false" } = req.query;

    const options = { where: { guildId, userId, type }, limit };
    if (today === "true") {
        options.where.createdAt = { [Op.between]: [startOfDay, endOfDay] };
    }

    fetchUserActivities(options, res, next);
});

module.exports = router;