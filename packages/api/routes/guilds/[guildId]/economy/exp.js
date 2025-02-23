const express = require("express");
const router = express.Router({ mergeParams: true });

const { sequelize } = require('../../../../database/sequelize');
const { UserCareers } = require("../../../../database/models");
const { findOneRecord } = require("../../../../utils/RequestManager");
const { calculateCareerXP } = require("../../../../utils/FunctionManager");

/**
 * POST api/guilds/:guildId/economy/gain/:userId
 * @description Add experience points to the user	
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 */
router.post("/gain/:userId", async (req, res, next) => {
    const t = await sequelize.transaction();
    const { guildId, userId } = req.params;
    const { amount = 100 } = req.body;
    const options = { where: { guildId: guildId, userId: userId } };

    try {
        let userCareer = await findOneRecord(UserCareers, options);
        if (!userCareer) return;

        // Store the previous user level details
        const previousUserCareerLevel = { ...userCareer.dataValues };

        // Calculate the experience to add
        const experience_gain = calculateCareerXP(amount);

        // Update the user's experience by adding experience
        userCareer.experience += experience_gain;

        // Save the updated record and use { returning: true } to get updated values back
        await userCareer.save({ transaction: t, returning: true });

        // Commit the transaction
        await t.commit();

        res.status(200).json({
            message: `User gained ${experience_gain} experience points for his career`,
            previous: previousUserCareerLevel,
            current: userCareer
        });

    } catch (error) {
        t.rollback();
        next(error);
    }
});

module.exports = router;