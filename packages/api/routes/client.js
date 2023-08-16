/* RESTFUL API for Flux
 Intented for Private use only
 Copyright © 2023
*/

// → Require Packages & Modules
const express = require("express");
const router = express.Router();

// → Importing Database Models & Classes
const { ClientCommands } = require("../database/models");
const { sequelize } = require('../database/sequelize');
const { createError } = require('../utils/ClassManager');
const { validateParams, validateData } = require('../utils/FunctionManager');
// → Define the routes for 'api/client'

// Get default information on the API
// router.get("/", async (req, res, next) => {
// });

// → Define the routes for 'api/client/commands'

// Get all client commands
router.get("/commands", async (req, res, next) => {
  try {
    //find all client commands
    const commands = await ClientCommands.findAll();

    //check for any client commands, else trigger error
    if (!commands) throw new createError(404, 'No client commands found.');

    //return data
    return res.status(200).json(commands);

  } catch (error) {
    next(error);
  }
});

// Save new client command
router.post("/command", async (req, res, next) => {
  //start a transaction
  const t = await sequelize.transaction();
  try {
    //get and validate the data
    if (!req.body) throw new createError(400, 'No request data provided.');
    const data = validateData(req, ['command']);
    if (data instanceof createError) throw data;

    const [command, created] = await ClientCommands.findOrCreate({
      where: { commandId: data.command.commandId },
      defaults: {
        commandId: data.command.commandId,
        commandName: data.command.commandName,
        private: data.command.private,
        help: data.command.help,
      },
      transaction: t
    });

    if (!created) {
      //if the command already exists, update it
      command.commandName = data.command.commandName;
      command.private = data.command.private;
      await command.save({ transaction: t });
      res.status(201).send('Command updated succesfully')
    } else {
      res.status(201).send('Command created succesfully')
    }

    //commit the transaction
    await t.commit();

  } catch (error) {
    //if error, rollback
    await t.rollback();
    next(error);
  }
});

// → Export Router to App
module.exports = router;