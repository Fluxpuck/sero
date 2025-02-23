const express = require("express");
const router = express.Router({ mergeParams: true });

const { sequelize } = require('../../../../database/sequelize');
const { Guild, User, UserLevels } = require("../../../../database/models");
const { findAllRecords, findOneRecord, createOrUpdateRecord } = require("../../../../utils/RequestManager");
const { CreateError, RequestError } = require("../../../../utils/ClassManager");

const { calculateLevelXP } = require("../../../../utils/FunctionManager");

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
        const { experience } = await req.body;

        // Check if the required fields are provided
        if (!experience) {
            throw new RequestError(400, "Missing experience data. Please check and try again", {
                method: req.method, path: req.path
            });
        }

        // Find existing user level record
        let userLevel = await findOneRecord(UserLevels, options);
        if (!userLevel) {
            // Create a new UserLevels entry if not found
            userLevel = await UserLevels.create({ guildId: guildId, userId: userId }, { transaction: t });
        }

        // Store the previous user level details
        const previousUserLevel = { ...userLevel.dataValues };

        // Update the user's experience by adding experience
        userLevel.experience = (userLevel.experience ?? 0) + experience;

        // Ensure experience doesn't go below 0
        if (userLevel.experience < 0) {
            userLevel.experience = 0;
        }

        // Save the updated record and use { returning: true } to get updated values back
        await userLevel.save({ transaction: t, returning: true });

        const returnMessage = experience < 0
            ? `${experience} experience points removed from user`
            : `${experience} experience points added to user`;

        res.status(200).json({
            message: returnMessage,
            previous: previousUserLevel,
            current: userLevel
        });

        // Commit the transaction
        await t.commit();

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
        let userLevel = await findOneRecord(UserLevels, options);
        if (!userLevel) {
            // Create a new UserLevels entry if not found
            userLevel = await UserLevels.create({ guildId: guildId, userId: userId }, { transaction: t });
        }

        // Store the previous user level details
        const previousUserLevel = { ...userLevel.dataValues };

        // Get the server and personal modifiers
        const { modifier: serverModifier = 1 } = await Guild.findByPk(guildId);
        const { modifier: personalModifier = 1 } = await User.findOne(options);

        // Calculate the experience to add
        const experience_gain = calculateLevelXP(serverModifier, personalModifier);

        // Update the user's experience by adding experience
        userLevel.experience += experience_gain;

        // Save the updated record and use { returning: true } to get updated values back
        await userLevel.save({ transaction: t, returning: true });

        // Commit the transaction
        await t.commit();

        res.status(200).json({
            message: `User gained ${experience_gain} experience points`,
            previous: previousUserLevel,
            current: userLevel
        });

    } catch (error) {
        t.rollback();
        next(error);
    }
});

module.exports = router;