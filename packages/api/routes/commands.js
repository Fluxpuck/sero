const express = require("express");
const router = express.Router();
const { Commands } = require("../database/models");
const { sequelize } = require('../database/sequelize');
const { CreateError } = require('../utils/ClassManager');

/**
 * @router GET api/commands
 * @description Get all Client/Application commands
 */
router.get("/", async (req, res, next) => {
  try {
    // Find all client commands
    const result = await Commands.findAll();

    // If no results found, trigger error
    if (!result) {
      throw new CreateError(404, 'No commands were found');
    }

    // Return the results
    return res.status(200).json(result);

  } catch (error) {
    next(error);
  }
});

/**
 * @router GET api/commands/:commandId
 * @description Get a specific Client/Application command
 */
router.get("/:commandId", async (req, res, next) => {
  try {
    const { commandId } = req.params;

    // Check for results related to the guildId
    const result = await Commands.findAll({
      where: { commandId: commandId },
    });

    // If no results found, trigger error
    if (!result) {
      throw new CreateError(404, 'Command was not found');
    }

    // Return the results
    return res.status(200).json(result);

  } catch (error) {
    next(error);
  }
});


// Setup Attributes for this Route
const requiredProperties = ['commandName'];

/**
 * @router POST api/commands/:commandName
 * @description Save a new Client/Application command
 */
router.post("/:commandName", async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { body, params } = req;
    const { commandName } = params;

    // Check if the request body has all required properties
    if (!body || Object.keys(body).length === 0 || requiredProperties.some(prop => body[prop] === undefined)) {
      throw new CreateError(400, 'Invalid or missing data for this request');
    }

    // Get the data from the request body
    const {
      commandId,
      interactionType,
      interactionOptions,
      description,
      usage } = body;
    // Create a new data object
    const updateData = {
      commandId: commandId,
      commandName: commandName,
      interactionType: interactionType,
      interactionOptions: interactionOptions,
      description: description,
      usage: usage,
    };

    // Check if the command already exists
    const request = await Commands.findOne({
      where: {
        commandName: commandName
      },
      transaction: t
    });

    // Update or Create the request
    if (request) {
      await request.update(updateData, { transaction: t });
      res.status(200).send(`${commandName} was updated successfully`);
    } else {
      await Commands.create(updateData, { transaction: t });
      res.status(200).send(`${commandName} was created successfully`);
    }

    // Commit and finish the transaction
    return t.commit();

  } catch (error) {
    await t.rollback();
    next(error);
  }
});



/**
 * @router DELETE api/commands/:commandName
 * @description Delete a specific Client/Application command
 */
router.delete("/:commandName", async (req, res, next) => {
  try {
    const { commandName } = req.params;

    // Check if the command exists
    const request = await Commands.findOne({
      where: {
        commandName: commandName
      }
    });

    // If no results found, trigger error
    if (!request || request.length === 0) {
      throw new CreateError(404, 'Command was not found');
    }

    // Delete the command
    await request.destroy();

    // Return the results
    return res.status(200).send(`${commandName} was deleted successfully`);

  } catch (error) {
    next(error);
  }
});



// → Export Router to App
module.exports = router;