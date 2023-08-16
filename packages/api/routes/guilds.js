/* RESTFUL API for Flux
 Intented for Private use only
 Copyright © 2023
*/

// → Require Packages & Modules
const express = require('express');
const router = express.Router();

// → Importing Database Models & Classes
const { Guild, EventChannels } = require("../database/models");
const { sequelize } = require('../database/sequelize');
const { createError } = require('../utils/ClassManager');
const { validateParams, validateData } = require('../utils/FunctionManager');

// → Define the routes for 'api/guild'

// Get all Guilds
router.get('/', async (req, res, next) => {
  try {
    //find all guilds
    const guilds = await Guild.findAll();
    //check for any guild, else trigger error
    if (!guilds) throw new createError(404, 'No guilds found.');

    //return data
    return res.status(200).json(guilds);

  } catch (error) {
    next(error);
  }
  return;
});

// Get Guild by Id
router.get('/:guildId', async (req, res, next) => {
  try {
    //validate the params
    const validation = validateParams(req, ['guildId'])
    if (validation) throw validation

    //get guildId from the request
    const guildId = req.params.guildId;

    //find guild by guildId
    const guild = await Guild.findOne({
      where: { guildId: guildId }
    })
    //check if guild is present, else trigger error
    if (!guild) throw new createError(404, 'Guild not found.');

    //return data
    return res.status(200).json(guild);

  } catch (error) {
    next(error);
  }
  return;
});

// Create or update Guild
router.post('/:guildId', async (req, res, next) => {
  //start a transaction
  const t = await sequelize.transaction();
  try {
    //get and validate the data
    if (!req.body) throw new createError(400, 'No request data provided.');
    const data = validateData(req, ['guild']);
    if (data instanceof createError) throw data;

    //get guildId from the request
    const guildId = req.params.guildId;

    //find the Guild by guildId
    const guild = await Guild.findOne({
      where: { guildId: guildId },
      transaction: t
    });

    if (guild) {
      //if the guild already exists, update guildName
      guild.guildName = data.guild.guildName;
      guild.active = true;
      await guild.save({ transaction: t });
      res.status(200).send('Guild updated successfully');
    } else {
      //create a new Guild
      await Guild.create({
        guildName: data.guild.guildName,
        guildId: guildId
      }, { transaction: t });
      res.status(201).send('Guild created successfully');
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

// Deactivate a Guild
router.post('/deactivate/:guildId', async (req, res, next) => {
  //start a transaction
  const t = await sequelize.transaction();
  try {
    //get and validate the data
    if (!req.body) throw new createError(400, 'No request data provided.');
    const data = validateData(req, ['guild']);
    if (data instanceof createError) throw data;

    //get guildId from the request
    const guildId = req.params.guildId;

    const guild = await Guild.findByPk(guildId);
    if (!guild) throw new createError(404, 'Guild not found.');

    //deactivate the guild
    guild.active = false;
    await guild.save({ transaction: t });

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

// Delete a Guild
router.delete('/:guildId', async (req, res, next) => {
  //start a transaction
  const t = await sequelize.transaction();
  try {
    //validate the params
    const validation = validateParams(req, ['guildId'])
    if (validation) throw validation

    //get guildId from the request
    const guildId = req.params.guildId;

    //delete guild from model
    const guild = await Guild.destroy({ where: { guildId: guildId }, transaction: t });
    if (!guild) throw new createError(400, 'Guild not found.');

    //commit the transaction
    await t.commit();

    //success message
    return res.status(204).send('Guild removed succesfully')

  } catch (error) {
    //rollback the transaction if an error occurs
    await t.rollback();
    next(error);
  }
  return;
});


// → Define the routes for 'api/guild/events'

// Get All Guild Events Settings
router.get('/events/:guildId', async (req, res, next) => {
  try {
    //validate the params
    const validation = validateParams(req, ['guildId'])
    if (validation) throw validation

    //get guildId from the request
    const guildId = req.params.guildId;

    //find guild by guildId
    const guild = await EventChannels.findOne({
      where: { guildId: guildId }
    })
    //check if guild is present, else trigger error
    if (!guild) throw new createError(404, 'Guild not found.');

    //return data
    return res.status(200).json(guild);

  } catch (error) {
    next(error);
  }
  return;
});

// Get Guild Events Settings by Category
router.get('/events/:guildId/:category', async (req, res, next) => {
  try {
    //validate the params
    const validation = validateParams(req, ['guildId', 'category'])
    if (validation) throw validation

    //get guildId and category from the request
    const { guildId, category } = req.params.guildId;

    //find guild by guildId
    const eventchannel = await EventChannels.findOne({
      where: {
        guildId: guildId,
        category: category
      }
    })
    //check if guild is present, else trigger error
    if (!eventchannel) throw new createError(404, 'Event channel not found.');

    //return data
    return res.status(200).json(eventchannel);

  } catch (error) {
    next(error);
  }
  return;
});

// Update Guild Events Settings
router.post('/settings/:guildId/:category', async (req, res, next) => {
  //start a transaction
  const t = await sequelize.transaction();
  try {
    //get and validate the data
    if (!req.body) throw new createError(400, 'No request data provided.');
    const data = validateData(req, ['event']);
    if (data instanceof createError) throw data;

    //get guildId and category from the request
    const { guildId, category } = req.params;

    //create or update a Guild
    const [eventchannel, created] = await EventChannels.findOrCreate({
      where: {
        guildId: guildId,
        category: category
      },
      defaults: {
        category: data.event.category,
        channelId: data.event.channelId
      },
      transaction: t
    });

    if (!created) {
      //if the category already exists, update channelId
      eventchannel.channelId = data.event.channelId;
      await guild.save({ transaction: t });
      res.status(201).send('Event channel updated succesfully')
    } else {
      res.status(201).send('Event channel created succesfully')
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

// Delete Guild Events Settings
router.delete('/settings/:guildId/category', async (req, res, next) => {
  //start a transaction
  const t = await sequelize.transaction();
  try {
    //validate the params
    const validation = validateParams(req, ['guildId, category'])
    if (validation) throw validation

    //get guildId and category from the request
    const { guildId, category } = req.params;

    //delete guild from model
    const eventchannel = await EventChannels.destroy({ where: { guildId: guildId, category: category }, transaction: t });
    if (!eventchannel) throw new createError(400, 'Event channel not found.');

    //commit the transaction
    await t.commit();

    //success message
    return res.status(204).send('Event channel removed succesfully')

  } catch (error) {
    //rollback the transaction if an error occurs
    await t.rollback();
    next(error);
  }
  return;
});


// → Export Router to App
module.exports = router;