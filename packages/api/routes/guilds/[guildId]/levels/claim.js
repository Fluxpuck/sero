const express = require("express");
const router = express.Router({ mergeParams: true });

const { sequelize } = require('../../../../database/sequelize');
const { UserLevels } = require("../../../../database/models");
const { findAllRecords, findOneRecord, createOrUpdateRecord } = require("../../../../utils/RequestManager");
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

        // Check if the user has a level
        const user = await findOneRecord(UserLevels, options);
        if (!user) {
            throw new CreateError(404, "User levels not found");
        }

        // Check if the user already claimed the reward
        if (user.reward_claimed) {
            throw new CreateError(400, "User already claimed the reward");
        }

        // Update the user's experience by adding experience
        user.reward_claimed = true;

        // Save the updated record
        await user.save({ transaction: t });

        // Commit the transaction
        await t.commit();

        res.status(200).json({ message: "User reward claimed", data: user });


    } catch (error) {
        t.rollback();
        next(error);
    }
});

module.exports = router;