const express = require("express");
const { Op } = require('sequelize');
const router = express.Router({ mergeParams: true });

const { Guild, User, UserLevels } = require("../../../../database/models");
const { findAllRecords, findOneRecord, createOrUpdateRecord } = require("../../../../utils/RequestManager");
const { calculateXP } = require("../../../../utils/FunctionManager");

/**
 * POST api/guilds/:guildId/levels/exp/:userId
 * @description Add or detract experience points to the user
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 * @param {number} experience - The experience points to add or detract
 */
router.post("/:userId", async (req, res, next) => {
    const t = await sequelize.transaction();
    const { guildId, userId } = req.params;
    const options = { where: { guildId: guildId, userId: userId } };

    try {
        const { experience } = req.body;

        // Check if the required fields are provided
        if (!experience) {
            throw new RequestError(400, "Invalid Request", {
                method: req.method, path: req.path
            });
        }

        const userLevel = await findOneRecord(UserLevels, options);
        if (!userLevel) {
            throw new CreateError(404, "User levels not found in the guild");
        } else {

            // Update the user's experience by adding experience
            userLevel.experience = (userLevel.experience ?? 0) + experience;

            // Save the updated record
            await userLevel.save({ transaction });

            // Commit the transaction
            await t.commit();

            const returnMessage = experience < 0
                ? `${experience} experience points removed from user`
                : `${experience} experience points added to user`;
            res.status(200).json({ message: returnMessage, data: userLevel });
        }

    } catch (error) {
        t.rollback();
        next(error);
    }
});

/**
 * POST api/guilds/:guildId/levels/gain/:userId
 * @description Add experience points to the user	
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 */
router.post("/gain/:userId", async (req, res, next) => {
    const t = await sequelize.transaction();
    const { guildId, userId } = req.params;
    const options = { where: { guildId: guildId, userId: userId } };

    try {
        const userLevel = await findOneRecord(UserLevels, options);
        if (!userLevel) {
            throw new CreateError(404, "User levels not found in the guild");
        } else {

            // Get the server and personal modifiers
            const { modifier: serverModifier = 1 } = await Guild.findByPk(guildId);
            const { modifier: personalModifier = 1 } = await User.findOne(options);

            // Calculate the experience to add
            const experience_gain = calculateXP(serverModifier, personalModifier);

            // Update the user's experience by adding experience
            levels.experience = experience_gain

            // Save the updated record
            await userLevel.save({ transaction });

            // Commit the transaction
            await t.commit();

            res.status(200).json({ message: `User gained ${experience_gain} experience points`, data: userLevel });
        }

    } catch (error) {
        t.rollback();
        next(error);
    }
});


module.exports = router;