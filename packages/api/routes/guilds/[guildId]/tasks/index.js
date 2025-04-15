const express = require("express");
const router = express.Router({ mergeParams: true });

const { ScheduledTasks } = require("../../../../database/models");
const { findAllRecords, findOneRecord, createOrUpdateRecord, withTransaction } = require("../../../../utils/RequestManager");
const { CreateError, RequestError } = require("../../../../utils/ClassManager");

/**
 * GET api/guilds/:guildId/tasks
 * @description Get all active scheduled tasks for a guild
 * @param {string} guildId - The id of the guild
 */
router.get("/", async (req, res, next) => {
    const { guildId } = req.params;
    const options = { where: { guildId: guildId } };

    try {
        const guildTasks = await findAllRecords(ScheduledTasks, options);
        if (!guildTasks) {
            throw new CreateError(404, "No active scheduled tasks were found for the guild");
        } else {
            res.status(200).json(guildTasks);
        }
    } catch (error) {
        next(error);
    }
});


/**
 * GET api/guilds/:guildId/tasks/:userId
 * @description Get scheduled tasks for a specific user in a guild
 * @param {string} guildId - The id of the guild
 * @param {string} userId - The id of the user
 */
router.get("/:userId", async (req, res, next) => {
    const { guildId, userId } = req.params;
    const options = { where: { guildId, userId } };

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
    const { taskId, userId, schedule, task, maxExecutions, executionCount, startDate, endDate } = req.body;

    // Validate required fields
    if (!taskId || !userId || !schedule || !task) {
        throw new RequestError(400, "Missing required fields", {
            method: req.method,
            path: req.path,
            required: ['taskId', 'userId', 'schedule', 'task']
        });
    }

    try {
        const result = await withTransaction(async (t) => {
            const taskData = {
                taskId,
                guildId,
                userId,
                schedule,
                task,
                maxExecutions,
                executionCount: executionCount || 0,
                startDate,
                endDate,
            };

            const [createdTask, created] = await createOrUpdateRecord(ScheduledTasks, taskData, t);

            return {
                message: created ? "Task created successfully" : "Task updated successfully",
                data: createdTask
            };
        });

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});


/**
 * DELETE api/guilds/:guildId/tasks/:taskId
 * @description Delete a scheduled task for a guild
 * @param {string} guildId - The id of the guild
 * @param {string} taskId - The id of the task
 */
router.delete("/:taskId", async (req, res, next) => {
    const { guildId, taskId } = req.params;
    const options = { where: { guildId: guildId, taskId: taskId } };

    try {
        const deletedTask = await ScheduledTasks.destroy(options);
        if (!deletedTask) {
            throw new CreateError(404, "No scheduled tasks were found for the guild");
        } else {
            res.status(200).json({ message: "Scheduled task deleted successfully" });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;