const express = require('express');
const router = express.Router();
const { Guild, User, Messages } = require("../../../database/models");
const { sequelize } = require('../../../database/sequelize');
const { CreateError } = require('../../../utils/ClassManager');

/**
 * @router GET api/messages/:guildId
 * @description Get all Messages
 */
router.get("/:guildId", async (req, res, next) => {
  try {
    const { guildId } = req.params;
    const limit = req.query.limit || 100000;

    // Find all messages per guild
    const result = await Messages.findAll({
      where: { guildId: guildId },
      limit: limit,
    });

    // If no results found, trigger error
    if (!result) {
      throw new CreateError(404, 'No Messages found for this guild.');
    }

    // Return the results
    return res.status(200).json(result);

  } catch (error) {
    next(error);
  }
});

/**
 * @router GET api/messages/:guildId/:userId
 * @description Get all Messages from a specific user
 */
router.get("/:guildId/:userId", async (req, res, next) => {
  try {
    const { guildId, userId } = req.params;
    const limit = req.query.limit || 50000;

    // Find all messages per user
    const result = await Messages.findAll({
      where: {
        guildId: guildId,
        userId: userId
      },
      limit: limit,
    });

    // If no results found, trigger error
    if (!result) {
      throw new CreateError(404, 'No Messages found for this user.');
    }

    // Return the results
    return res.status(200).json(result);

  } catch (error) {
    next(error);
  }
});


// Setup Attributes for this Route
const requiredProperties = ['messageId', 'channelId'];

/**
 * @router POST api/messages/:guildId/:userId
 * @description Create a Message
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

    // Check if the guild exists && If no guild found, trigger error
    const guild = await Guild.findByPk(guildId);
    if (!guild) { throw new CreateError(404, 'Guild not found') };

    // Check if the user exists && If no user found, trigger error
    const user = await User.findOne({ where: { userId: userId, guildId: guildId } });
    if (!user) { throw new CreateError(404, 'User not found') }

    // Get the data from request body && create object
    const { messageId, channelId } = body;

    // Create a new message
    const request = await Messages.create({
      guildId: guildId,
      userId: userId,
      messageId: messageId,
      channelId: channelId
    }, { transaction: t });

    // Return success
    res.status(200).json({
      message: `Message (${messageId}) from ${guildId}/${userId} was stored successfully`,
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