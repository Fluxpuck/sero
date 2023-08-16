/* RESTFUL API for Flux
 Intented for Private use only
 Copyright © 2023
*/

// → Require Packages & Modules
const express = require('express');
const router = express.Router();

// → Importing Database Models & Classes
const { Guild, User, Moderator } = require("../database/models");
const { sequelize } = require('../database/sequelize');
const { createError } = require('../utils/ClassManager');
const { validateParams, validateData } = require('../utils/FunctionManager');

// → Define the routes for 'api/moderators'

/**
 * Get all Guild Moderators
 */
router.get("/:guildId", async (req, res, next) => {
    try {
        //validate the params
        const validation = validateParams(req, ['guildId'])
        if (validation) throw validation

        //get guildId from the request
        const guildId = req.params.guildId;

        //find all moderators  
        const moderators = await Moderator.findAll({ where: { guildId: guildId } });
        //check for any moderator, else trigger error
        if (!moderators) throw new createError(404, 'No moderators found.');

        //return data  
        return res.status(200).json(moderators);
    } catch (error) {
        next(error);
    }
    return;
});

/**
 * Get Guild Moderator by userId
 */
router.get("/:guildId/:userId", async (req, res, next) => {
    try {

        //validate the params
        const validation = validateParams(req, ['guildId', 'userId'])
        if (validation) throw validation

        //get guildId & userId
        const { guildId, userId } = req.params;

        //find moderator by userId
        const moderator = await Moderator.findOne({
            where: { userId: userId, guildId: guildId }
        });
        //check if moderator is present, else trigger error
        if (!moderator) throw new createError(404, 'Moderator not found.');

        //return data
        return res.status(200).json(moderator);

    } catch (error) {
        next(error);
    }
    return;
});

/**
 * Create a new Moderator
 */
router.post("/:guildId/:userId", async (req, res, next) => {
    //start a transaction
    const t = await sequelize.transaction();
    try {
        //validate the params
        const validation = validateParams(req, ['guildId', 'userId'])
        if (validation) throw validation

        //get guildId & userId
        const { guildId, userId } = req.params;

        const guild = await Guild.findByPk(guildId);
        if (!guild) throw new createError(404, 'Guild not found.');

        const user = await User.findOne({ where: { userId: userId, guildId: guildId } });
        if (!user) throw new createError(404, 'User not found.');

        //get and validate the data
        if (!req.body) throw new createError(400, 'No request data provided.');
        const data = validateData(req, ['moderator']);
        if (data instanceof createError) throw data;

        //create or update a Moderator
        const [moderator, created] = await Moderator.findOrCreate({
            where: {
                guildId: guildId,
                userKey: user.userKey
            },
            defaults: {
                location: data.moderator.location || undefined,
                language: data.moderator.language || 'English',
                rank: 'Moderator'
            },
            transaction: t
        });

        if (!created) {
            //if the moderator already exists, update location & language
            moderator.location = data.moderator.location || undefined;
            moderator.language = data.moderator.language || 'English';
            moderator.rank = 'Moderator';
            await moderator.save({ transaction: t });
            res.status(201).send('Moderator updated succesfully')
        } else {
            res.status(201).send('Moderator created succesfully')
        }

        //commit the transaction
        await t.commit();

    } catch (error) {
        //rollback the transaction if an error occurs
        await t.rollback();
        next(error);
    }
    return;
});

/**
 * Delete a Moderator
 */
router.delete("/:userId", async (req, res, next) => {
    //start a transaction
    const t = await sequelize.transaction();
    try {
        //validate the params
        const validation = validateParams(req, ['userId'])
        if (validation) throw validation

        //get userId from the request
        const userId = req.params.userId;

        //delete moderator from model
        const moderator = await Moderator.destroy({ where: { userId: userId }, transaction: t });
        if (!moderator) throw new createError(404, 'Moderator not found.');

        //commit the transaction
        await t.commit();

        //success message
        res.status(200).send('Moderator deleted succesfully');

    } catch (error) {
        //rollback the transaction if an error occurs
        await t.rollback();
        next(error);
    }
    return;
});




// → Define the routes for 'api/moderatorstats'

/**
 * Get all Guild Moderator Stats
 */
router.get("/stats/:guildId", async (req, res, next) => {
    try {
        //validate the params
        const validation = validateParams(req, ['guildId'])
        if (validation) throw validation

        //get guildId from the request
        const guildId = req.params.guildId;

        //find all moderatorStats  
        const moderatorstats = await ModeratorStats.findAll({ where: { guildId: guildId } });
        //check for any moderator, else trigger error
        if (!moderatorstats) throw new createError(404, 'No moderators found.');

        //return data
        return res.status(200).json(moderatorstats);
    } catch (error) {
        next(error);
    }
    return;
});

/**
 * Get Guild Moderator Stats by userId
 */
router.get("/stats/:guildId/:userId", async (req, res, next) => {
    try {
        //validate the params
        const validation = validateParams(req, ['guildId', 'userId'])
        if (validation) throw validation

        //get guildId & userId
        const { guildId, userId } = req.params;

        //find moderator by userId
        const moderatorstats = await ModeratorStats.findOne({
            where: { guildId: guildId, userId: userId }
        });
        //check if moderator is present, else trigger error
        if (!moderatorstats) throw new createError(404, 'Moderator not found.');

        //return data
        return res.status(200).json(moderatorstats);

    } catch (error) {
        next(error);
    }
    return;
});



// → Export Router to App
module.exports = router;