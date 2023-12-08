const express = require("express");
const router = express.Router();
const { Commands } = require("../database/models");
const { sequelize } = require('../database/sequelize');
const { createError } = require('../utils/ClassManager');

// Setup Attributes for this Route
const CommandAttributes = ['commandName', 'clientId'];

// → Define the routes for 'api/commands'
// Get all client commands
router.get("/", async (req, res, next) => {
  try {
    //find all client commands
    const commands = await Commands.findAll();
    //check for any client commands, else trigger error
    if (!commands) throw new createError(404, 'No client commands found.');
    // return data
    return res.status(200).json(commands);

  } catch (error) {
    next(error);
  }
});

// Get a specific client commands
router.get("/:commandId", async (req, res, next) => {
  try {
    const { commandId } = req.params; // Extract the commandId from the request parameters
    // Find the client command by commandId
    const command = await Commands.findOne({ where: { commandId: commandId } });
    // Check if the command exists, else trigger an error
    if (!command) {
      throw new createError(404, 'Client command not found.');
    }
    // Return the data
    return res.status(200).json(command);
  } catch (error) {
    next(error);
  }
});

// Save new client command 
router.post("/:commandName", async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { body, params } = req;
    const COMMAND_NAME = params.commandName;

    // Validate request data
    if (!body || Object.keys(body).length === 0) {
      throw new createError(400, 'No command data provided.');
    }
    // Validate required fields
    const missingFields = CommandAttributes.filter(field => !(field in body));
    if (missingFields.length > 0) {
      throw new createError(400, `Missing required fields: ${missingFields.join(', ')}`);
    }

    //find the Command by commandName
    const command = await Commands.findOne({
      where: { commandName: COMMAND_NAME },
      transaction: t
    });

    const {
      commandId,
      commandName,
      clientId,
      interactionType,
      interactionOptions,
      description,
      usage } = body;

    if (command) {
      //if the command already exists, update command
      command.commandId = commandId;
      command.commandName = commandName;
      command.interactionType = interactionType;
      command.interactionOptions = interactionOptions;
      command.clientId = clientId;
      command.description = description;
      command.usage = usage;

      await command.save({ transaction: t });
      res.status(200).send(`Command (${commandId}) updated successfully`);
    } else {
      //create a new Guild
      await Commands.create({
        commandId,
        commandName,
        clientId,
        description,
        usage,
      }, { transaction: t });
      res.status(201).send(`Command (${commandId}) created successfully`);
    }

    //commit the transaction
    await t.commit();

  } catch (error) {
    //rollback the transaction if an error occurs
    await t.rollback();
    next(error);
  }
});

// → Export Router to App
module.exports = router;