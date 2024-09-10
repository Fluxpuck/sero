const express = require("express");
const router = express.Router({ mergeParams: true });

const { sequelize } = require('../../../../database/sequelize');
const { UserLevels } = require("../../../../database/models");
const { findOneRecord } = require("../../../../utils/RequestManager");
const { CreateError, RequestError } = require("../../../../utils/ClassManager");

/**
 * POST api/guilds/:guildId/levels/claim/:userId
 * @description Claim the reward for the user
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
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

        // Check if the user has a level
        const user = await findOneRecord(UserLevels, options);
        if (!user) {
            throw new CreateError(404, "User levels not found");
        }

        // Check if the user already claimed the reward
        if (user.reward_claimed) {
            throw new CreateError(204, "User already claimed the reward");
        }

        // Mark the reward as claimed
        user.reward_claimed = true;
        await user.save({ transaction: t });

        // Update the user's experience
        user.experience = (user.experience ?? 0) + experience;
        await user.save({ transaction: t });

        res.status(200).json({ message: `${experience} experience points added to user`, data: user });

        // Commit the transaction
        await t.commit();

    } catch (error) {
        // Rollback the transaction in case of error
        await t.rollback();
        next(error);
    }
});

module.exports = router;