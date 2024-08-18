const express = require("express");
const router = express.Router({ mergeParams: true });

const { UserCareers } = require("../../../../../database/models");
const { findAllRecords, findOneRecord, createOrUpdateRecord } = require("../../../../../utils/RequestManager");

/**
 * GET api/guilds/:guildId/career/:userId
 * @description Get the user career in the guild
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 */
router.get("/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const options = { where: { guildId: guildId, userId: userId } };

    try {
        const userCareer = await findOneRecord(UserCareers, options);
        if (!userCareer) {
            throw new CreateError(404, "User career not found in the guild");
        } else {
            res.status(200).json(userCareer);
        }
    } catch (error) {
        next(error);
    }
});

/**
 * POST api/guilds/:guildId/career
 * @description Create or update a user career in the guild
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 * @param {string} jobId - The id of the job
 */
router.post("/", async (req, res, next) => {
    const t = await sequelize.transaction();
    const { guildId } = req.params;

    try {
        const {
            userId,
            jobId,
            level = 1,
        } = req.body;

        // Check if the required fields are provided
        if (!userId || !jobId) {
            throw new RequestError(400, "Invalid Request", {
                method: req.method, path: req.path
            });
        }

        // Update or create the career
        const [result, created] = await createOrUpdateRecord(UserCareers, { guildId, userId, jobId, level }, t);

        // Commit the transaction
        await t.commit();

        // Send the appropriate response
        if (created) {
            res.status(201).json({ message: "User career created successfully", data: result });
        } else {
            res.status(200).json({ message: "User career updated successfully", data: result });
        };

    } catch (error) {
        t.rollback();
        next(error);
    }
});

/**
 * POST api/guilds/:guildId/career/levelup/:userId
 * @description Add one level to the user career
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 * @param {number} level - The level of the job
 */
router.post("levelup/:userId", async (req, res, next) => {
    const t = await sequelize.transaction();
    const { guildId, userId } = req.params;
    const options = { where: { guildId: guildId, userId: userId } };

    try {
        const userCareer = await findOneRecord(userCareer, options);
        if (!userCareer) {
            throw new CreateError(404, "User levels not found in the guild");
        } else {

            // Update the user's level by adding 1
            userCareer.level = + 1;

            // Save the updated record
            await userCareer.save({ transaction });

            // Commit the transaction
            await t.commit();

            res.status(200).json({ message: "Added one level to the user career", data: userCareer });
        }

    } catch (error) {
        t.rollback();
        next(error);
    }
});

/**
 * DELETE api/guilds/:guildId/career/:userId
 * @description Delete a specific user career in the guild
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 */
router.delete("/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const options = { where: { guildId: guildId, userId: userId } };

    try {
        const userCareer = await findOneRecord(UserCareers, options);
        if (!userCareer) {
            throw new CreateError(404, "User career not found in the guild");
        } else {
            await userCareer.destroy();
            res.status(200).json({ message: "User career deleted successfully" });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;