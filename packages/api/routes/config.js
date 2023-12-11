const express = require("express");
const router = express.Router();
const { ConfigFlags } = require("../database/models");
const { sequelize } = require('../database/sequelize');
const { createError } = require('../utils/ClassManager');

/**
 * @router GET api/config
 * @description Get all Client/Application config
 */
router.get("/", async (req, res, next) => {
  try {
    // Find all client config
    const result = await ConfigFlags.findAll();

    // If no results found, trigger error
    if (!result || result.length === 0) {
      throw new createError(404, 'No client configurations found');
    }

    // Return the results
    return res.status(200).json(result);

  } catch (error) {
    next(error);
  }
});


/**
 * @router GET api/config/:configName
 * @description Get a specific Client/Application config
 */
router.get("/:configName", async (req, res, next) => {
  try {
    const { configName } = req.params;

    // Check for results related to the guildId
    const result = await ConfigFlags.findAll({
      where: { config: configName },
    });

    // If no results found, trigger error
    if (!result || result.length === 0) {
      throw new createError(404, 'No client configurations found');
    }

    // Return the results
    return res.status(200).json(result);

  } catch (error) {
    next(error);
  }
});


// Setup Attributes for this Route
const requiredProperties = ['config', 'value'];

/**
 * @router POST api/config/:configName
 * @description Save a specific Client/Application config
 */
router.post("/:configName", async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { body, params } = req;
    const { configName } = params;

    // Check if the request body has all required properties
    if (!body || Object.keys(body).length === 0 || requiredProperties.some(prop => body[prop] === undefined)) {
      throw new createError(400, 'Invalid or missing data for this request');
    }

    // Get the data from request body && create object
    const { config, value } = body;
    const updateData = {
      config: config,
      value: value
    };

    // Check if the config already exists
    const request = await ConfigFlags.findAll({
      where: {
        config: configName
      },
      transaction: t,
    });

    // Update or Create the request
    if (request) {
      await request.update(updateData, { transaction: t });
      res.status(200).send(`The configflag ${configName} was updated successfully`);
    } else {
      await ConfigFlags.create(updateData, { transaction: t });
      res.status(200).send(`The configflag ${configName} was created successfully`);
    }

    // Commit and finish the transaction
    return t.commit();

  } catch (error) {
    await t.rollback();
    next(error);
  }
});


/**
 * @router DELETE api/config/:configName
 * @description Delete a specific Client/Application config
 */
router.delete("/:configName", async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { configName } = req.params;

    // Check if the config exists
    const request = await ConfigFlags.findAll({
      where: {
        config: configName
      },
      transaction: t,
    });

    // If no results found, trigger error
    if (!request || request.length === 0) {
      throw new createError(404, 'No client configurations found');
    }

    // Delete the command
    await request.destroy();

    // Return the results
    return res.status(200).send(`The configflag ${configName} was deleted successfully`);

  } catch (error) {
    await t.rollback();
    next(error);
  }
});


// → Export Router to App
module.exports = router;