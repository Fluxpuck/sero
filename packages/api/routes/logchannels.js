const express = require("express");
const router = express.Router();
const { LogChannels } = require("../database/models");
const { sequelize } = require('../database/sequelize');
const { CreateError } = require('../utils/ClassManager');

/**
 * @router GET api/logchannels/:guildId
 * @description Get all logchannels for a specific guild
 */
router.get("/:guildId", async (req, res, next) => {
  try {
    const { guildId } = req.params;

    // Check for results related to the guildId
    const result = await LogChannels.findAll({
      where: { guildId: guildId },
    });

    // If no results found, trigger error
    if (!result || result.length === 0) {
      throw new CreateError(404, 'No logchannels for this guildId found.');
    }

    // Return the results
    return res.status(200).json(result);

  } catch (error) {
    next(error);
  }
});

/**
 * @router GET api/logchannels/:guildId/:category
 * @description Get the logchannel for a specific category from a guildId
 */
router.get("/:guildId/:category", async (req, res, next) => {
  try {
    const { guildId, category } = req.params;

    // Check if the category is already in LogChannels
    const result = await LogChannels.findOne({
      where: {
        guildId: guildId,
        category: category
      },
    });

    // If no results found, trigger error
    if (!result || result.length === 0) {
      throw new CreateError(404, 'No logchannel for this category and guildId found.');
    }

    // Return the results
    return res.status(200).json(result);

  } catch (error) {
    next(error);
  }
});


// Setup Attributes for this Route
const requiredProperties = ['channelId'];

/**
 * @router POST api/logchannels/:guildId/:category
 * @description Save the logchannel for a specific category from a guildId
 */
router.post("/:guildId/:category", async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { body, params } = req;
    const { guildId, category } = params;

    // Check if the request body has all required properties
    if (!body || Object.keys(body).length === 0 || requiredProperties.some(prop => body[prop] === undefined)) {
      throw new CreateError(400, 'Invalid or missing data for this request');
    }

    // Get the data from the request body && create object
    const { channelId } = body;
    const updateData = {
      guildId: guildId,
      category: category,
      channelId: channelId
    }

    // Check if the category is already in LogChannels
    const logchannels = await LogChannels.findOne({
      where: {
        guildId: guildId,
        category: category,
      },
      transaction: t
    });

    // Update or Create the request
    if (logchannels) {
      await logchannels.update(updateData, { transaction: t });
      res.status(200).json({
        message: `Logchannel for ${guildId}/${category} updated successfully`,
        data: logchannels
      });
    } else {
      const request = await LogChannels.create(updateData, { transaction: t });
      res.status(200).json({
        message: `Logchannel status for ${guildId}/${category} created successfully`,
        data: request
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
 * @router DELETE api/logchannels/:guildId/:category
 * @description Delete the logchannel to a specific category from a specific guild
 */
router.delete("/:guildId/:category", async (req, res, next) => {
  try {
    const { guildId, category } = req.params;

    // Check if the category is already in LogChannels
    const request = await LogChannels.findOne({
      where: {
        guildId: guildId,
        category: category
      },
    });

    // If no results found, trigger error
    if (!request || request.length === 0) {
      throw new CreateError(404, 'No logchannel for this combination of guildId and category found.');
    }

    // Delete the request
    await request.destroy();

    // Return the results
    return res.status(200).json(`The logchannel for ${guildId}/${category} was deleted successfully`);

  } catch (error) {
    next(error);
  }
});



// → Export Router to App
module.exports = router;