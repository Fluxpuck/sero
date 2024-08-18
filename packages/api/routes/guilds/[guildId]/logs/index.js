const express = require("express");
const router = express.Router({ mergeParams: true });

const { Logs, LogChannels } = require("../../../../database/models");
const { findAllRecords, findOneRecord, createOrUpdateRecord } = require("../../../../utils/RequestManager");
const { generateUniqueToken } = require("../../../../utils/FunctionManager");

/**
 * GET api/guilds/:guildId/logs
 * @description Get all logs for a specific guild user
 * @param {string} limit - The number of logs to return
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 */
router.get("/userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const { limit } = req.query;
    const options = { limit: limit || 10, where: { guildId: guildId, userId: userId } };

    try {
        const guildLogs = await findAllRecords(Logs, options);
        if (!guildLogs) {
            throw new CreateError(404, "No logs were found for the user in the guild");
        } else {
            res.status(200).json(guildLogs);
        }
    } catch (error) {
        next(error);
    }
});

/**
 * GET api/guilds/:guildId/logs/:logId
 * @description Get a specific log from a guild
 * @param {string} guildId - The id of the guild
 * @param {string} logId - The id of the log
 */
router.get("/:logId", async (req, res, next) => {
    const { guildId, logId } = req.params;
    const options = { where: { guildId: guildId, logId: logId } };

    try {
        const guildLog = await findOneRecord(Logs, options);
        if (!guildLog) {
            throw new CreateError(404, "Log with logId not found in the guild");
        } else {
            res.status(200).json(guildLog);
        }
    } catch (error) {
        next(error);
    }
});

/**
 * POST api/guilds/:guildId/logs
 * @description Create or update a guild log
 * @param {string} guildId - The id of the guild
 * @param {string} id - The id of the log
 * @param {string} auditAction - The action of the audit
 * @param {string} auditType - The type of the audit
 * @param {string} targetId - The id of the target
 * @param {string} reason - The reason for the audit
 * @param {string} executorId - The id of the executor
 * @param {string} duration - The duration of the audit
 */
router.post("/", async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const {
            guildId
        } = req.params;
        const {
            id = generateUniqueToken(),
            auditAction,
            auditType,
            targetId,
            reason = null,
            executorId,
            duration = null
        } = req.body;

        // Check if the required fields are provided
        if (!auditAction || !auditType || !targetId || !executorId) {
            throw new RequestError(400, "Invalid Request", {
                method: req.method, path: req.path
            });
        }

        // Update or create the log
        const [result, created] = await createOrUpdateRecord(Logs, {
            id,
            auditAction,
            auditType,
            targetId,
            reason,
            executorId,
            duration,
            guildId
        }, t);

        // Commit the transaction
        await t.commit();

        // Send the appropriate response
        if (created) {
            res.status(201).json({ message: "Log created successfully", data: result });
        } else {
            res.status(200).json({ message: "Log updated successfully", data: result });
        };

    } catch (error) {
        t.rollback();
        next(error);
    }
});

/**
 * PUT api/guilds/:guildId/logs/:logId
 * @description Update a guild log
 * @param {string} guildId - The id of the guild
 * @param {string} logId - The id of the log
 */
router.delete("/:logId", async (req, res, next) => {
    const { guildId, logId } = req.params;
    const options = { where: { guildId: guildId, logId: logId } };

    try {
        const guildLog = await findOneRecord(Logs, options);
        if (!guildLog) {
            throw new CreateError(404, "Log with logId not found in the guild");
        } else {
            await guildLog.destroy();
            res.status(200).json({ message: "Log deleted successfully" });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;