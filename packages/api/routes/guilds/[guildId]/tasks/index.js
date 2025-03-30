const express = require("express");
const router = express.Router({ mergeParams: true });

const { sequelize } = require('../../../../database/sequelize');
const { ScheduledTasks, GuildSettings } = require("../../../../database/models");
const { findAllRecords, findOneRecord, createOrUpdateRecord, withTransaction } = require("../../../../utils/RequestManager");
const { CreateError, RequestError } = require("../../../../utils/ClassManager");

/**
 * GET api/guilds/:guildId/tasks
 * @description Get all scheduled tasks for a guild
 * @param {string} guildId - The id of the guild
 */
router.get("/", async (req, res, next) => {
    const { guildId } = req.params;
    const options = { where: { guildId: guildId } };

    try {
        const guildSettings = await findAllRecords(GuildSettings, options);
        if (!guildSettings) {
            throw new CreateError(404, "No scheduled tasks were found for the guild");
        } else {
            res.status(200).json(guildSettings);
        }
    } catch (error) {
        next(error);
    }
});


/**
 * GET api/guilds/:guildId/tasks/:taskId
 * @description Get a specific scheduled task for a guild
 * @param {string} guildId - The id of the guild
 * @param {string} taskId - The id of the task
 */
router.get("/:taskId", async (req, res, next) => {
    const { guildId, taskId } = req.params;
    const options = { where: { guildId: guildId, taskId: taskId } };

    try {
        const guildSettings = await findOneRecord(ScheduledTasks, options);
        if (!guildSettings) {
            throw new CreateError(404, "No scheduled tasks were found for the guild");
        } else {
            res.status(200).json(guildSettings);
        }
    } catch (error) {
        next(error);
    }
});

/**
 * POST api/guilds/:guildId/tasks
 * @description Create a new scheduled task for a guild
 * @param {string} guildId - The ID of the guild
 * @body {Object} task - The task object containing the details of the task
 */
router.post("/", async (req, res, next) => {
    const { guildId } = req.params;

    // Validate required fields
    if (!taskId || !userId || !schedule || !tool || !toolInput) {
        throw new RequestError(400, "Missing required fields: guildId and guildName are required", {
            method: req.method,
            path: req.path,
        });
    }

    try {
        const result = await withTransaction(async (t) => {

            const taskData = {
                taskId,
                guildId,
                userId,
                channelId,
                schedule,
                tool,
                toolInput,
                maxExecutions,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                status,
            };

            const [result, created] = await createOrUpdateRecord(ScheduledTasks, taskData, t);

            return {
                message: created ? "Task created successfully" : "Task updated successfully",
                data: result,
            };

        });

        res.status(200).json(result);

    } catch (error) {
        next(error);
    }
});

/**
/**
 * GET api/guilds/:guildId/tasks/:userId
 * @description Get scheduled tasks for a specific user in a guild
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 */
router.get("/:userId", async (req, res, next) => {
    const options = { where: { guildId: guildId, userId: userId } };

    try {
        const guildSettings = await findOneRecord(ScheduledTasks, options);
        if (!guildSettings) {
            throw new CreateError(404, "No scheduled tasks were found for the guild");
        } else {
            res.status(200).json(guildSettings);
        }
    } catch (error) {
        next(error);
    }
});



module.exports = router;