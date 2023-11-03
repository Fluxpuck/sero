const express = require("express");
const router = express.Router();
const { Client, Commands } = require("../database/models");
const { sequelize } = require('../database/sequelize');
const { createError } = require('../utils/ClassManager');
const { validateParams, validateData } = require('../utils/FunctionManager');

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

// Save new client command 
router.post("/command", async (req, res, next) => {



});

// → Export Router to App
module.exports = router;