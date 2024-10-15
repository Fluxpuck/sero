const express = require("express");
const router = express.Router({ mergeParams: true });
const { startOfDay, isSameDay, isBefore, subDays } = require('date-fns');
const { UserActivities } = require("../../../../database/models");
const { findAllRecords } = require("../../../../utils/RequestManager");
const { CreateError } = require("../../../../utils/ClassManager");

/**
 * GET api/guilds/:guildId/activities/streak/:userId/:type
 * @description Get user's activity streak in a guild
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 * @param {string} type - The type of activity
 */
router.get("/:userId/:type", async (req, res, next) => {
    const { guildId, userId, type } = req.params;

    try {
        const options = {
            where: {
                guildId,
                userId,
                type
            },
            order: [['createdAt', 'DESC']]
        };

        const userActivitiesData = await findAllRecords(UserActivities, options);
        if (!userActivitiesData || userActivitiesData.length === 0) {
            throw new CreateError(404, "No activities found for the user in the guild");
        }

        let streak = 0;
        let currentDate = startOfDay(new Date());
        for (const activity of userActivitiesData) {
            const activityDate = startOfDay(new Date(activity.createdAt));
            if (isSameDay(activityDate, currentDate)) {
                streak++;
                currentDate = subDays(currentDate, 1);
            } else if (isBefore(activityDate, currentDate)) {
                // If there's a gap, stop counting
                break;
            }
        }

        res.status(200).json({ streak });
    } catch (error) {
        next(error);
    }
});

module.exports = router;