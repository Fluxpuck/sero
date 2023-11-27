const express = require('express');
const router = express.Router();

// → Importing Database Models & Classes
const { Guild, User } = require("../database/models");
const { sequelize } = require('../database/sequelize');
const { createError } = require('../utils/ClassManager');
const { validateParams, validateData } = require('../utils/FunctionManager');

// → Define the routes for 'api/users'

/**
 * Get all Users per Guild
 */
router.get('/:guildId', async (req, res, next) => {
    try {
        //validate the params
        const validation = validateParams(req, ['guildId'])
        if (validation) throw validation

        //get guildId from the request
        const guildId = req.params.guildId;

        //find all users per guild
        const users = await User.findAll({ where: { guildId: guildId } });
        //check for any guild, else trigger error
        if (!users) throw new createError(404, 'No users found.');

        //return data
        return res.status(200).json(users);
    } catch (error) {
        next(error);
    }
    return;
});

/**
 * Get all Guilds per User
 */
router.get('/:userId', async (req, res, next) => {
    try {
        //validate the params
        const validation = validateParams(req, ['userId'])
        if (validation) throw validation

        //get guildId from the request
        const userId = req.params.userId;

        //find all users per guild
        const user = await User.findAll({ where: { userId: userId } });
        //check for any guild, else trigger error
        if (!user) throw new createError(404, 'No user found.');

        //return data
        return res.status(200).json(user);
    } catch (error) {
        next(error);
    }
    return;
});

/**
 * Get User by Id
 */
router.get('/:guildId/:userId', async (req, res, next) => {
    try {
        //validate the params
        const validation = validateParams(req, ['guildId', 'userId']);
        if (validation) throw validation;

        //get guildId & userId
        const { guildId, userId } = req.params;

        //find user by guildId & userId
        const user = await User.findOne({
            where: { guildId: guildId, userId: userId }
        })
        //check if user is present, else trigger error
        if (!user) throw new createError(404, 'User not found.');

        //return data
        return res.status(200).json(user);

    } catch (error) {
        next(error);
    }
    return;
});

/**
 * Create or update User
 */
router.post('/:guildId/:userId', async (req, res, next) => {
    //start a transaction
    const t = await sequelize.transaction();
    try {

        //validate the params
        const validation = validateParams(req, ['guildId', 'userId']);
        if (validation) throw validation;

        //get guildId & userId
        const { guildId, userId } = req.params;

        const guild = await Guild.findByPk(guildId);
        if (!guild) throw new createError(404, 'Guild not found.');

        //validate the data
        if (!req.body) throw new createError(400, 'No request data provided.');
        const data = validateData(req, ['user']);
        if (data instanceof createError) throw data;

        //create or update a User
        const [user, created] = await User.findOrCreate({
            where: {
                userId: userId,
                guildId: guildId
            },
            defaults: {
                userName: data.user.userName,
                userId: data.user.userId,
                guildId: guildId
            },
            transaction: t
        });

        if (!created) {
            //if the user already exists, update userName
            user.userName = data.user.userName;
            user.active = true;
            await user.save({ transaction: t });
            res.status(201).send('User updated succesfully')
        } else {
            res.status(201).send('User created succesfully')
        }

        //commit transaction
        await t.commit();

    } catch (error) {
        //rollback the transaction if an error occurs
        await t.rollback();
        next(error);
    }
    return;
});

/**
 * Deactivate a User
 */
router.post('/deactivate/:guildId/:userId', async (req, res, next) => {
    //start a transaction
    const t = await sequelize.transaction();
    try {
        //get and validate the data
        if (!req.body) throw new createError(400, 'No request data provided.');
        const data = validateData(req, ['guild']);
        if (data instanceof createError) throw data;

        const guild = await Guild.findByPk(guildId);
        if (!guild) throw new createError(404, 'Guild not found.');

        const user = await User.findByPk(userId);
        if (!user) throw new createError(404, 'User not found.');

        //deactivate the user
        user.active = false;
        await user.save({ transaction: t });

        //commit the transaction
        await t.commit();

        //success message
        return res.status(200).send('Guild deactivated succesfully');

    } catch (error) {
        //rollback the transaction if an error occurs
        await t.rollback();
        next(error);
    }
});


/**
 * Delete a User
 */
router.delete('/:guildId/:userId', async (req, res, next) => {
    //start a transaction
    const t = await sequelize.transaction();
    try {
        //validate the params
        const validation = validateParams(req, ['guildId', 'userId']);
        if (validation) throw validation;

        //get guildId & userId
        const { guildId, userId } = req.params;

        //delete guild from model
        const user = await User.destroy({ where: { userId: userId, guildId: guildId }, transaction: t });
        if (!user) throw new createError(400, 'User not found.');

        //commit the transaction
        await t.commit();

        //success message
        return res.status(204).send('User removed succesfully')

    } catch (error) {
        //rollback the transaction if an error occurs
        await t.rollback();
        next(error);
    }
    return;
});

// → Export Router to App
module.exports = router;