const express = require('express');
const router = express.Router();

// → Importing Database Models & Classes
const { Levels, User, Guild } = require("../database/models");
const { sequelize } = require('../database/sequelize');
const { createError } = require('../utils/ClassManager');
const { validateParams } = require('../utils/FunctionManager');
const { calculateXP } = require('../utils/levelManager');

// → Define the routes for 'api/leaderboard'

/**
 * Get all Levels per Guild
 */
router.get('/:guildId', async (req, res, next) => {
  try {
    //validate the params
    const validation = validateParams(req, ['guildId'])
    if (validation) throw validation

    //get guildId from the request
    const guildId = req.params.guildId;

    //find all levels per guild
    const levels = await Levels.findAll({
      where: { guildId: guildId }
    });
    //check for any levels, else trigger error
    if (!levels) throw new createError(404, 'No levels found.');

    //return data
    return res.status(200).json(levels);
  } catch (error) {
    next(error);
  }
  return;
});

/**
 * Get all Levels from a User
 */
router.get('/:guildId/:userId', async (req, res, next) => {
  try {
    //validate the params
    const validation = validateParams(req, ['guildId', 'userId'])
    if (validation) throw validation

    //get guildId & userId
    const { guildId, userId } = req.params;

    //find all levels per user
    const levels = await Levels.findAll({
      where: { guildId: guildId, userId: userId }
    });
    //check for any levels, else trigger error
    if (!levels) throw new createError(404, 'No levels found.');

    //return data
    return res.status(200).json(levels);
  } catch (error) {
    next(error);
  }
  return;
});

/**
 * Create or update a User Level
 */
router.post('/:guildId/:userId', async (req, res, next) => {
  //start transaction
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

    //create or update user level
    const level = await Levels.findOrCreate({
      where: {
        guildId: guildId,
        userId: userId,
        userKey: user.userKey
      },
      defaults: {
        guildId: guildId,
        userId: userId,
        userKey: user.userKey
      },
      transaction: t,
    });

    if (!level) {
      //if the user already has levels, update level
      level.experience = data.level.experience;
      await level.save({ transaction: t });
      res.status(201).send('User\'s experience updated succesfully')
    } else {
      res.status(201).send('User level created succesfully')
    }

    //commit transaction
    await t.commit();

  } catch (error) {
    //rollback transaction if error occurs
    await t.rollback();
    next(error);
  }
  return;
});

/**
 * Add experience to a User Level
 */
router.post('/gain/:guildId/:userId', async (req, res, next) => {
  //start transaction
  const t = await sequelize.transaction();
  try {

    //validate the params
    const validation = validateParams(req, ['guildId', 'userId'])
    if (validation) throw validation

    //get guildId & userId
    const { guildId, userId } = req.params;

    //find user level
    const level = await Levels.findOne({
      where: { guildId: guildId, userId: userId }
    });
    //check for any levels, else trigger error
    if (!level) throw new createError(404, 'No levels found for this user');

    //calculate the XP
    let personalModifier = 1; //TODO: add personal modifier, based on personal settings?
    let serverModifier = 1; //TODO: add server modifier, based on guild settings?
    const XP_gain = calculateXP(personalModifier, serverModifier);

    //add XP to the user's experience
    level.experience += XP_gain;
    await level.save({ transaction: t });

    //commit transaction
    await t.commit();

    //return data
    return res.status(200).json({ XP_gain: XP_gain });

  } catch (error) {
    //rollback transaction if error occurs
    await t.rollback();
    next(error);
  }
  return;
});

/**
 * Reset a User Level
 */
router.delete('/:guildId/:userId', async (req, res, next) => {
  //start transaction
  const t = await sequelize.transaction();
  try {

    //validate the params
    const validation = validateParams(req, ['guildId', 'userId'])
    if (validation) throw validation

    //get guildId & userId
    const { guildId, userId } = req.params;

    //find user level
    const level = await Levels.findOne({
      where: { guildId: guildId, userId: userId }
    });
    //check for any levels, else trigger error
    if (!level) throw new createError(404, 'No levels found.');

    //reset user's experience
    level.experience = 0;
    await level.save({ transaction: t });

    //commit transaction
    await t.commit();

    //return data
    return res.status(200).send('User\'s experience has been reset succesfully')

  } catch (error) {
    //rollback transaction if error occurs
    await t.rollback();
    next(error);
  }
  return;
});

// → Export Router to App
module.exports = router;




