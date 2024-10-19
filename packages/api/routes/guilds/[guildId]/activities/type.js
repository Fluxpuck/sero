const express = require("express");
const router = express.Router({ mergeParams: true });

const { UserActivities } = require("../../../../database/models");
const { findAllRecords } = require("../../../../utils/RequestManager");
const { CreateError } = require("../../../../utils/ClassManager");

const { Op } = require('sequelize');
const { startOfToday, endOfToday } = require('date-fns');

/**
 * GET api/guilds/:guildId/activities/:type
 * @description Get all guild activities by type
 * @param {string} limit - The number of activities to return
 * @param {string} guildId - The id of the guild
 * @param {string} type - The type of activity
 */
router.get("/:type", async (req, res, next) => {
    const { guildId, type } = req.params;
    const { limit = 10, today = "false" } = req.query;

    const options = {
        where: { guildId, type },
        limit: parseInt(limit, 10)
    };

    if (today === "true") {
        options.where.createdAt = { [Op.between]: [startOfToday(), endOfToday()] };
    }

    try {
        const typeActivitiesData = await findAllRecords(UserActivities, options);
        if (!typeActivitiesData || typeActivitiesData.length === 0) {
            throw new CreateError(404, "No activities found with the specified type in the guild");
        }
        res.status(200).json(typeActivitiesData);
    } catch (error) {
        next(error);
    }
});

module.exports = router;