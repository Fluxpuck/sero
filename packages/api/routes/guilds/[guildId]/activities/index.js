const express = require("express");
const router = express.Router({ mergeParams: true });

const { sequelize } = require('../../../../database/sequelize');
const { UserActivities, User, Guild } = require("../../../../database/models");
const { findAllRecords, createUniqueRecord, findOneRecord } = require("../../../../utils/RequestManager");
const { CreateError, RequestError } = require("../../../../utils/ClassManager");

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

        // Check if the guildId exists in the Guilds table
        const guildExists = await findOneRecord(Guild, { id: guildId });
        if (!guildExists) {
            throw new RequestError(400, "Invalid guildId. Guild does not exist.", {
                method: req.method, path: req.path
            });
        }

        // Check if the userId exists in the Users table
        const userExists = await findOneRecord(User, { id: userId });
        if (!userExists) {
            throw new RequestError(400, "Invalid userId. User does not exist.", {
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

module.exports = router;