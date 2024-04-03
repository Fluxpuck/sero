const express = require('express');
const router = express.Router();
const { User } = require("../database/models");
const { sequelize } = require('../database/sequelize');
const { CreateError } = require('../utils/ClassManager');

/**
 * @router GET api/users/:guildId
 * @description Get all Users
 */
router.get("/", async (req, res, next) => {
    try {
        const { guildId } = req.params;
        const limit = req.query.limit || 200000;

        // Find all users
        const result = await User.findAll({
            where: { guildId: guildId },
            limit: limit,
        });

        // If no results found, trigger error
        if (!result) {
            throw new CreateError(404, 'No users were found');
        }

        // Return the results
        return res.status(200).json(result);

    } catch (error) {
        next(error);
    }
});

/**
 * @router GET api/users/:guildId/:userId
 * @description Get a specific User
 */
router.get("/:guildId/:userId", async (req, res, next) => {
    try {
        const { guildId, userId } = req.params;

        // Check for results related to the guildId
        const result = await User.findOne({
            where: {
                guildId: guildId,
                userId: userId
            },
        });

        // If no results found, trigger error
        if (!result) {
            throw new CreateError(404, 'User was not found');
        }

        // Return the results
        res.status(200).json(result);

    } catch (error) {
        next(error);
    }
});


// Setup Attributes for this Route
const requiredProperties = ['userName'];

/**
 * @router POST api/users/:guildId/:userId
 * @description Create or update a User
 */
router.post('/:guildId/:userId', async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { body, params } = req;
        const { guildId, userId } = params;

        // Check if the request body has all required properties
        if (!body || Object.keys(body).length === 0 || requiredProperties.some(prop => body[prop] === undefined)) {
            throw new CreateError(400, 'Invalid or missing data for this request');
        }

        // Get the data from request body && create object
        const { userName } = body;
        const updateData = {
            guildId: guildId,
            userId: userId,
            userName: userName
        }

        // Check if the guild already exists
        const request = await User.findOne({
            where: {
                guildId: guildId,
                userId: userId
            },
            transaction: t,
        });

        // Update or Create the request
        if (request) {
            const result = await request.update(updateData, { transaction: t });
            res.status(200).json({
                message: `User ${userId} was updated successfully`,
                data: result
            });
        } else {
            const result = await User.create(updateData, { transaction: t });
            res.status(200).json({
                message: `User ${userId} was created successfully`,
                data: result
            });
        }

        // Commit and finish the transaction
        return t.commit();

    } catch (error) {
        await t.rollback();
        next(error);
    }
});

/**
 * @router DELETE api/users/:guildId/:userId
 * @description Delete a User
 */
router.delete("/:guildId/:userId", async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { guildId, userId } = req.params;

        // Check if the guild already exists
        const request = await User.findOne({
            where: {
                guildId: guildId,
                userId: userId
            },
            transaction: t,
        });

        // If no results found, trigger error
        if (!request) {
            throw new CreateError(404, 'User was not found');
        }

        // Delete the request
        await request.destroy({ transaction: t });
        res.status(200).json({
            message: `User ${userId} was deleted successfully`,
            data: request
        });

        // Commit and finish the transaction
        return t.commit();

    } catch (error) {
        await t.rollback();
        next(error);
    }
});

// → Export Router to App
module.exports = router;