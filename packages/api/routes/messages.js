const express = require('express');
const router = express.Router();

// → Importing Database Models & Classes
const { Guild, User, Messages } = require("../database/models");
const { sequelize } = require('../database/sequelize');
const { createError } = require('../utils/ClassManager');
const { validateParams, validateData } = require('../utils/FunctionManager');

// → Define the routes for 'api/messages'

/**
 * Get message count per server
 */
router.get("/:guildId", async (req, res, next) => {
  try {
    //validate the params
    const validation = validateParams(req, ['guildId'])
    if (validation) throw validation

    //get guildId from the request
    const guildId = req.params.guildId;

    //find all messages per guild
    const messages = await Messages.findAll({
      where: { guildId: guildId },
      include: [{
        model: Guild,
        attributes: ['guildName'],
        required: true,
        duplicating: false
      }],
      distinct: true
    });
    //check for any messages, else trigger error
    if (!messages) throw new createError(404, 'No messages found.');

    //return data
    return res.status(200).json(messages);

  } catch (error) {
    next(error);
  }
  return;
});

/**
 * Get message count per user
 */
router.get("/:guildId/:userId", async (req, res, next) => {
  try {
    //validate the params
    const validation = validateParams(req, ['guildId', 'userId'])
    if (validation) throw validation

    //get guildId & userId
    const { guildId, userId } = req.params;

    //find all messages per user
    const messages = await Messages.findAll({
      where: { guildId: guildId, userId: userId },
      include: [{
        model: Guild,
        attributes: ['guildName'],
        required: true,
        duplicating: false
      }],
      distinct: true
    });
    //check for any messages, else trigger error
    if (!messages) throw new createError(404, 'No messages found.');

    //return data
    return res.status(200).json(messages);
  } catch (error) {
    next(error);
  }
  return;
});

/**
 * Add message to database
 */
router.post("/:guildId/:userId", async (req, res, next) => {
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

    const user = await User.findByPk(userId);
    if (!user) throw new createError(404, 'User not found.');

    //validate the data
    if (!req.body) throw new createError(400, 'No request data provided.');
    const data = validateData(req, ['message']);
    if (data instanceof createError) throw data;

    //save message to database
    await Messages.create({
      guildId: guildId,
      userId: userId,
      messageId: data.message.messageId,
      channelId: data.message.channlId
    }, {
      transaction: t,
    });

    //commit transaction
    await t.commit();

    //send success response
    res.status(201).send('Message was stored successfully');

  } catch (error) {
    //rollback transaction if error occurs
    await t.rollback();
    next(error);
  }
  return;
});

// → Export Router to App
module.exports = router;