const express = require("express");
const router = express.Router();
const { Logs, Guild, User } = require("../database/models");
const { sequelize } = require('../database/sequelize');
const { CreateError } = require('../utils/ClassManager');


/**
 * @router GET api/logs/:guildId
 * @description Get all Logs for a specific guild
 */
router.get("/:guildId", async (req, res, next) => {
    try {
        const { guildId } = req.params;
        const limit = req.query.limit || 100;

        // Find all logs per guild
        const result = await Logs.findAll({
            where: { guildId: guildId },
            limit: limit,
        });

        // If no results found, trigger error
        if (!result || result.length === 0) {
            throw new CreateError(404, 'No Logs found for this guild.');
        }

        // Return the results
        return res.status(200).json(result);

    } catch (error) {
        next(error);
    }
});

/**
 * @router GET api/logs/:guildId/:userId
 * @description Get all Logs from a specific user
 */
router.get("/:guildId/:userId", async (req, res, next) => {
    try {
        const { guildId, userId } = req.params;

        // Find all logs per user
        const result = await Logs.findAll({
            where: {
                guildId: guildId,
                targetId: userId
            },
        });

        // If no results found, trigger error
        if (!result || result.length === 0) {
            throw new CreateError(404, 'No Logs found for this user.');
        }

        // Return the results
        return res.status(200).json(result);

    } catch (error) {
        next(error);
    }
});

/**
 * @router GET api/logs/:logId
 * @description Get a specific Log
 */
router.get("/:logId", async (req, res, next) => {
    try {
        const { logId } = req.params;

        // Find a specific log
        const result = await Logs.findOne({
            where: {
                id: logId
            },
        });

        // If no results found, trigger error
        if (!result) {
            throw new CreateError(404, 'No Log found for this ID.');
        }

        // Return the results
        return res.status(200).json(result);

    } catch (error) {
        next(error);
    }
});

// Setup Attributes for this Route
const requiredProperties = ['auditAction', 'auditType', 'auditCategory', 'targetId', 'executorId'];

/**
 * @router POST api/logs/:guildId/:userId
 * @description Create a new Log
 */
router.post("/:guildId/:userId", async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { body, params } = req;
        const { guildId, userId } = params;

        // Check if the request body has all required properties
        if (!body || Object.keys(body).length === 0 || requiredProperties.some(prop => body[prop] === undefined)) {
            throw new CreateError(400, 'Invalid or missing data for this request');
        }

        // Check if the guild exists && If no guild found, trigger error
        const guild = await Guild.findByPk(guildId);
        if (!guild) { throw new CreateError(404, 'Guild not found') };

        // Get the data from request body && create object
        const { id, auditAction, auditType, auditCategory, targetId, reason, executorId, duration } = body;

        // Create the new Log
        const request = await Logs.create({
            id: id,
            auditAction: auditAction,
            auditType: auditType,
            auditCategory: auditCategory,
            targetId: targetId,
            reason: reason ?? null,
            executorId: executorId,
            duration: duration ?? null,
            guildId: guildId
        }, { transaction: t });

        // Return success
        res.status(200).json({
            message: `New log was created successfully`,
            data: request
        });

        // Commit Transaction
        await t.commit();

    } catch (error) {
        await t.rollback();
        next(error);
    }
});

/**
 * @router PUT api/logs/:logId
 * @description Update a specific Log
 */
router.put("/:logId", async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { logId } = req.params;

        // Check if the request body has all required properties
        if (!body || Object.keys(body).length === 0 || requiredProperties.some(prop => body[prop] === undefined)) {
            throw new CreateError(400, 'Invalid or missing data for this request');
        }

        // Check if the log exists && If no log found, trigger error
        const log = await Logs.findByPk(logId);
        if (!log) { throw new CreateError(404, 'Log not found') };

        // Get the data from request body && create object
        const { type, targetId, reason, executorId, duration } = body;

        // Update the log
        await log.update({
            type: type,
            targetId: targetId,
            reason: reason ?? null,
            executorId: executorId,
            duration: duration ?? null,
        }, { transaction: t });


    } catch (error) {
        await t.rollback();
        next(error);
    }
});


/**
 * @router DELETE api/logs/:logId
 * @description Delete a specific Log
 */
router.delete("/:logId", async (req, res, next) => {
    try {
        const { logId } = req.params;

        // Check if the log exists && If no log found, trigger error
        const log = await Logs.findByPk(logId);
        if (!log) { throw new CreateError(404, 'Log not found') };

        // Delete the log
        await log.destroy();

        // Return success
        res.status(200).json({
            message: `Log was deleted successfully`,
            data: log
        });

    } catch (error) {
        await t.rollback();
        next(error);
    }
});

// → Export Router to App
module.exports = router;