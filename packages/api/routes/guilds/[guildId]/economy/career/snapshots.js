const express = require("express");
const router = express.Router({ mergeParams: true });

const { Work_snapshot } = require("../../../../../database/models");
const { findAllRecords, findOneRecord, createOrUpdateRecord, createUniqueRecord } = require("../../../../../utils/RequestManager");

/**
 * GET api/guilds/:guildId/career/snapshots/:userId
 * @description Get the user career income in the guild
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 */
router.get("/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const options = {
        where: { guildId: guildId, userId: userId },
        order: [['createdAt', 'DESC']],
    };

    try {
        // Get all work snapshots for the user in the guild
        const workSnapshots = await findAllRecords(Work_snapshot, options);
        if (!workSnapshots) {
            throw new CreateError(404, "No work snapshots found for this user in the guild");
        } else {

            // Get the total income for the user in the guild
            const totalIncomeResult = await Work_snapshot.findOne({
                where: { guildId: guildId, userId: userId },
                attributes: [[fn('SUM', col('income')), 'totalIncome']],
                raw: true
            });

            const totalIncome = totalIncomeResult.totalIncome || 0;

            res.status(200).json({ totalIncome, workSnapshots });
        }
    } catch (error) {
        next(error);
    }
});

/**
 * GET api/guilds/:guildId/career/snapshots/weekly-reward/:userId
 * @description Check if the user in the guild is eligible for the weekly reward
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 */
router.get("streak/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const options = { where: { guildId: guildId, userId: userId }, order: [['createdAt', 'DESC']] };

    try {

        // Fetch all work snapshots for the last 5 days
        // Count the results and check if the user has worked for 5 consecutive days
        // If the user has worked for 5 consecutive days, return the results with a success boolean

    } catch (error) {
        next(error);
    }
});

/**
 * POST api/guilds/:guildId/career/snapshots
 * @description Create a user career snapshot in the guild
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 * @param {string} jobId - The id of the job
 * @param {number} income - The income of the user
 */
router.post("/", async (req, res, next) => {
    const t = await sequelize.transaction();
    const { guildId } = req.params;

    try {
        const {
            userId,
            jobId,
            income = 0,
        } = req.body;

        // Check if the required fields are provided
        if (!userId || !jobId) {
            throw new RequestError(400, "Invalid Request", {
                method: req.method, path: req.path
            });
        }

        // Create a new work snapshot
        const result = await createUniqueRecord(Work_snapshot, { guildId, userId, jobId, income }, t);

        // Commit the transaction
        await t.commit();

        // Send the appropriate response
        res.status(201).json({ message: "User career snapshot created successfully", data: result });

    } catch (error) {
        t.rollback();
        next(error);
    }
});

module.exports = router;