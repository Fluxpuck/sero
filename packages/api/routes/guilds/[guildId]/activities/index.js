const express = require("express");
const router = express.Router({ mergeParams: true });

const { sequelize } = require('../../../../database/sequelize');
const { UserActivities } = require("../../../../database/models");
const { findAllRecords, createUniqueRecord } = require("../../../../utils/RequestManager");
const { CreateError, RequestError } = require("../../../../utils/ClassManager");

const { Op } = require('sequelize');
const { startOfToday, endOfToday } = require('date-fns');

/**
 * GET api/guilds/:guildId/activities
 * @description Get all guild activities
 * @param {string} limit - The number of activities to return
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 */
router.get("/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const { limit } = req.query;
    const options = { where: { guildId: guildId, userId: userId }, limit: limit || 20 };

    try {
        const userActivitiesData = await findAllRecords(UserActivities, options);
        if (!userActivitiesData) {
            throw new CreateError(404, "User not away in the guild");
        } else {
            res.status(200).json(userActivitiesData);
        }
    } catch (error) {
        next(error);
    }
});

/**
 * POST api/guilds/:guildId/activities
 * @description Add a new user activity
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 * @param {string} type - The type of activity
 * @param {object} additional - Additional data for the activity
 */
router.post("/", async (req, res, next) => {
    const t = await sequelize.transaction();
    const { guildId } = req.params;

    try {
        const {
            userId,
            type,
            additional = {},
        } = req.body;

        // Check if the required fields are provided
        if (!userId || !type) {
            throw new RequestError(400, "Missing userId | type data. Please check and try again", {
                method: req.method, path: req.path
            });
        }

        // Create a new activity log
        const activityData = await createUniqueRecord(UserActivities, {
            guildId: guildId,
            userId: userId,
            type: type,
            additional: additional
        }, t);

        // Send the appropriate response
        res.status(201).json({ message: "User activity stored successfully", data: activityData });

        // Commit the transaction
        await t.commit();

    } catch (error) {
        t.rollback();
        next(error);
    }
});

/**
 * GET api/guilds/:guildId/activities
 * @description Get all guild activities
 * @param {string} limit - The number of activities to return
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 * @param {string} type - The type of activity
 */
router.get("/:userId/:type", async (req, res, next) => {
    // Get the start and end of the day
    const startOfDay = startOfToday();
    const endOfDay = endOfToday();

    const { guildId, userId, type } = req.params;
    const { limit = 10, today = "true" } = req.query;

    const options = { where: { guildId: guildId, userId: userId, type: type }, limit: limit };
    if (today === "true") {
        options.where.createdAt = { [Op.between]: [startOfDay, endOfDay] };
    }

    try {
        const userActivitiesData = await findAllRecords(UserActivities, options);
        if (!userActivitiesData) {
            throw new CreateError(404, "User not found in the guild");
        } else {
            res.status(200).json({ activities: userActivitiesData });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;