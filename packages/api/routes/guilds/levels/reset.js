const express = require("express");
const { Op } = require('sequelize');
const router = express.Router({ mergeParams: true });

const { UserLevels } = require("../../../database/models");
const { findAllRecords, findOneRecord, createOrUpdateRecord } = require("../../../utils/RequestManager");

/**
 * POST api/guilds/:guildId/levels/reset
 * @description Reset all the user levels in the guild
 * @param {string} guildId - The id of the guild
 */
router.post("/", async (req, res, next) => {
    const t = await sequelize.transaction();

    const { guildId } = req.params;

    try {

        // Update the values for all users in the guild
        await UserLevels.update(
            {
                experience: 0,
                currentLevelExp: 0,
                nextLevelExp: 100,
                remainingExp: 100,
                level: 0,
                rank: 1
            },
            {
                where: { guildId: guildId },
                transaction: t
            }
        );

        // Commit the transaction
        await t.commit();

        res.status(200).json({ message: "All guild user levels reset successfully" });

    } catch (error) {
        t.rollback();
        next(error);
    }
});

/**
 * POST api/guilds/:guildId/levels/reset/:userId
 * @description Reset the user levels in the guild
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 */
router.post("/:userId", async (req, res, next) => {
    const t = await sequelize.transaction();

    const { guildId, userId } = req.params;
    const options = { where: { guildId: guildId, userId: userId } };

    try {
        const userLevel = await findOneRecord(UserLevels, options);
        if (!userLevel) {
            throw new CreateError(404, "User levels not found in the guild");
        } else {

            // Update the values
            userLevel.experience = 0;
            userLevel.currentLevelExp = 0;
            userLevel.nextLevelExp = 100;
            userLevel.remainingExp = 100;
            userLevel.level = 0;
            userLevel.rank = 1;

            // Save the updated record
            await userLevel.save({ transaction });

            // Commit the transaction
            await t.commit();

            res.status(200).json({ message: "User level reset successfully", data: userLevel });
        }
    } catch (error) {
        t.rollback();
        next(error);
    }
});

module.exports = router;