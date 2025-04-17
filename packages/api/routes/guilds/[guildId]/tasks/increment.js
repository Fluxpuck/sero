const express = require("express");
const router = express.Router({ mergeParams: true });

const { sequelize } = require('../../../../database/sequelize');
const { ScheduledTasks } = require("../../../../database/models");
const { findAllRecords, findOneRecord, createOrUpdateRecord, withTransaction } = require("../../../../utils/RequestManager");
const { CreateError, RequestError } = require("../../../../utils/ClassManager");

/**
 * post api/guilds/:guildId/tasks/:taskId/increment
 * @description Increment the execution count of a task by 1
 * @param {string} guildId - The id of the guild
 * @param {string} taskId - The id of the task
 */
router.post("/:taskId", async (req, res, next) => {
    const { guildId, taskId } = req.params;

    try {
        const [updatedCount] = await ScheduledTasks.increment('executionCount', {
            where: { guildId, taskId }
        });

        if (updatedCount === 0) {
            throw new CreateError(404, "Task not found");
        }

        res.status(200).json({ message: "Execution count incremented successfully" });
    } catch (error) {
        next(error);
    }
});

module.exports = router;