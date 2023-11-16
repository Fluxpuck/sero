const express = require("express");
const router = express.Router();
const { Client, Commands } = require("../database/models");
const { sequelize } = require('../database/sequelize');
const { createError } = require('../utils/ClassManager');

const ClientAttributes = ['clientId', 'clientName'];
const CommandAttributes = ['commandId', 'commandName', 'clientId'];

// → Define the routes for 'api/client'
// Get default information on the API
router.get("/", async (req, res, next) => {
  try {
    // get all client information
    const client = await Client.findAll();
    // check for any clients, else trigger error
    if (!client) throw new createError(404, 'No client found.');
    // return data
    return res.status(200).json(commands);

  } catch (error) {
    next(error);
  }
});


// → Define the routes for 'api/client/commands'
// Get all client commands
router.get("/commands", async (req, res, next) => {
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
router.get("/command:commandId", async (req, res, next) => {
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
router.post("/commands:commandName", async (req, res, next) => {


  try {

    const { body, params } = req;
    const commandName = params.commandName;
    const t = await sequelize.transaction();

    return console.log(body)

    // Validate request data
    if (!body || Object.keys(body).length === 0) {
      throw new createError(400, 'No command data provided.');
    }
    // Validate required fields
    const missingFields = CommandAttributes.filter(field => !(field in body));
    if (missingFields.length > 0) {
      throw new createError(400, `Missing required fields: ${missingFields.join(', ')}`);
    }







  } catch (error) {
    //rollback the transaction if an error occurs
    await t.rollback();
    next(error);
  }
});

// → Export Router to App
module.exports = router;