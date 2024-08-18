const express = require("express");
const { Op } = require('sequelize');
const router = express.Router({ mergeParams: true });

const { User, UserLevels } = require("../../../../database/models");
const { findAllRecords, findOneRecord, createOrUpdateRecord } = require("../../../../utils/RequestManager");
const { CreateError, RequestError } = require("../../../../utils/ClassManager");

/**
 * GET api/guilds/:guildId/levels
 * @description Get all user levels from the guild
 * @param {string} limit - The number of levels to return
 * @param {string} guildId - The id of the guild
 */
router.get("/", async (req, res, next) => {
    const { guildId } = req.params;
    const { limit } = req.query;
    const options = { limit: limit || 100, where: { guildId: guildId } };

    try {
        const userLevels = await findAllRecords(UserLevels, options);
        if (!userLevels) {
            throw new CreateError(404, "No user with levels were found in the guild");
        } else {
            res.status(200).json(userLevels);
        }
    } catch (error) {
        next(error);
    }
});

/**
 * GET api/guilds/:guildId/levels/:userId
 * @description Get a specific user level from the guild
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 * @returns {object} - The user's level and position
 * And include the User model and level position
 */
router.get("/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const options = {
        where: { guildId: guildId, userId: userId },
        include: [{
            model: User,
            where: {
                guildId: guildId,
                userId: userId
            },
        }]
    };

    try {
        const userLevel = await findOneRecord(UserLevels, options);
        if (!userLevel) {
            throw new CreateError(404, "User levels not found in the guild");
        } else {

            // Calculate the position based on experience for the guild
            const position = await UserLevels.count({
                where: {
                    guildId: guildId,
                    experience: { [Op.gt]: result.experience }
                }
            });

            // Add the position to the userLevel object
            userLevel.position = position + 1;

            // Return the user's level and position
            return res.status(200).json(userLevel);

        }
    } catch (error) {
        next(error);
    }
});

/**
 * DELETE api/guilds/:guildId/levels/:userId
 * @description Delete a specific user level from the guild
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 */
router.delete("/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const options = { where: { guildId: guildId, userId: userId } };

    try {
        const userLevel = await findOneRecord(UserLevels, options);
        if (!userLevel) {
            throw new CreateError(404, "User levels not found in the guild");
        } else {
            await userLevel.destroy();
            res.status(200).json(userLevel);
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;