const express = require('express');
const router = express.Router();
const { Guild, User, Moderator } = require("../../database/models");
const { sequelize } = require('../../database/sequelize');
const { CreateError } = require('../../utils/ClassManager');

/**
 * @router GET api/moderators/:guildId
 * @description Get all Moderators
 */
router.get("/:guildId", async (req, res, next) => {
    try {
        const { guildId } = req.params;

        // Find all moderators per guild
        const result = await Moderator.findAll({
            where: { guildId: guildId }
        });

        // If no results found, trigger error
        if (!result || result.length === 0) {
            throw new CreateError(404, 'No Moderators found for this guild');
        }

        // Return the results
        return res.status(200).json(result);

    } catch (error) {
        next(error);
    }
});

/**
 * @router GET api/moderators/:guildId/:userId
 * @description Get all Moderators from a specific user
 */
router.get("/:guildId/:userId", async (req, res, next) => {
    try {
        const { guildId, userId } = req.params;

        // Find all moderators per user
        const result = await Moderator.findAll({
            where: {
                guildId: guildId,
                userId: userId
            },
        });

        // If no results found, trigger error
        if (!result || result.length === 0) {
            throw new CreateError(404, 'This user is not a Moderator in this guild.');
        }

        // Return the results
        return res.status(200).json(result);

    } catch (error) {
        next(error);
    }
});


/**
 * @router POST api/moderators/:guildId/:userId
 * @description Create or update a Moderator
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
        if (!guild) { return res.status(404).send(`Guild (${guildId}) not found`) };

        // Check if the user exists && If no user found, trigger error
        const user = await User.findOne({ where: { userId: userId, guildId: guildId } });
        if (!user) { return res.status(404).send(`User (${userId}) not found`) };

        // Get the data from request body && create object
        const { location, language } = body;
        const updateData = {
            guildId: guildId,
            userId: userId,
            location: location || undefined,
            language: language || 'English',
        }

        // Check if the guild already exists
        const request = await Moderator.findOne({
            where: {
                guildId: guildId
            },
            transaction: t,
        });

        // Update or Create the request
        if (request) {
            await request.update(updateData, { transaction: t });
            res.status(200).send(`Guild ${guildId} was updated successfully`);
        } else {
            await Moderator.create(updateData, { transaction: t });
            res.status(200).send(`Guild ${guildId} was created successfully`);
        }

        // Commit and finish the transaction
        return t.commit();

    } catch (error) {
        await t.rollback();
        next(error);
    }
});

/**
 * @router POST api/moderators/:guildId/:userId
 * @description Remove a Moderator
 */
router.delete("/:guildId/:userId", async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { guildId, userId } = req.params;

        // Check if the guild exists
        const request = await Moderator.findOne({
            where: {
                guildId: guildId,
                userId: userId
            }
        });

        // If no results found, trigger error
        if (!request || request.length === 0) {
            throw new CreateError(404, 'Guild was not found');
        }

        // Delete the moderator
        await request.destroy();

        // Return the results
        return res.status(200).send(`Moderator ${guildId}/${userId} was deleted successfully`);

    } catch (error) {
        await t.rollback();
        next(error);
    }
});


// → Export Router to App
module.exports = router;