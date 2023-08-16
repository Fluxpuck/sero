/* RESTFUL API for Flux
 Intented for Private use only
 Copyright © 2023
*/

// → Require Packages & Modules
const express = require('express');
const router = express.Router();

// → Importing Database Models & Classes
const { EventChannels } = require("../database/models");
const { sequelize } = require('../database/sequelize');
const { createError } = require('../utils/ClassManager');
const { validateParams, validateData } = require('../utils/FunctionManager');

// → Define the routes for 'api/guild'

/**
 * Get all EventChannel by guildId
 */
router.get('/:guildId', async (req, res, next) => {
  try {
    //validate the params
    const validation = validateParams(req, ['guildId'])
    if (validation) throw validation

    //get guildId from the request
    const guildId = req.params.guildId;

    //find guild by guildId
    const guildChannels = await EventChannels.findOne({
      where: { guildId: guildId }
    })
    //check if guild is present, else trigger error
    if (!guildChannels) throw new createError(404, 'No event channels found for this guild.');

    //return data
    return res.status(200).json(guildChannels);

  } catch (error) {
    next(error);
  }
  return;
});

/**
 * Create or update Guild
 */
router.post('/:guildId', async (req, res, next) => {
  //start a transaction
  const t = await sequelize.transaction();
  try {
    //get and validate the data
    if (!req.body) throw new createError(400, 'No request data provided.');
    const data = validateData(req, ['guild']);
    if (data instanceof createError) throw data;

    //create or update a Guild
    const [guild, created] = await Guild.findOrCreate({
      where: { guildId: data.guild.guildId },
      defaults: {
        guildName: data.guild.guildName,
        guildId: data.guild.guildId
      },
      transaction: t
    });

    if (!created) {
      //if the guild already exists, update guildName
      guild.guildName = data.guild.guildName;
      guild.active = true;
      await guild.save({ transaction: t });
      res.status(201).send('Guild updated succesfully')
    } else {
      res.status(201).send('Guild created succesfully')
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
 * Deactivate a Guild
 */
router.post('/deactivate/:guildId', async (req, res, next) => {
  //start a transaction
  const t = await sequelize.transaction();
  try {
    //get and validate the data
    if (!req.body) throw new createError(400, 'No request data provided.');
    const data = validateData(req, ['guild']);
    if (data instanceof createError) throw data;

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

/**
 * Delete a Guild
 */
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

// → Export Router to App
module.exports = router;