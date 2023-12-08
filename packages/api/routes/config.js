const express = require("express");
const router = express.Router();
const { ConfigFlags } = require("../database/models");
const { sequelize } = require('../database/sequelize');
const { createError } = require('../utils/ClassManager');

// → Define the routes for 'api/config'
// Get all client config
router.get("/", async (req, res, next) => {
  try {
    //find all client config
    const config = await ConfigFlags.findAll();
    //check for any client config, else trigger error
    if (!config) throw new createError(404, 'No client configs found.');
    // return data
    return res.status(200).json(config);

  } catch (error) {
    next(error);
  }
});

// Get a specific client commands
router.get("/:config", async (req, res, next) => {
  try {
    const { configName } = req.params; // Extract the config from the request parameters
    // Find the client config by name
    const config = await ConfigFlags.findOne({ where: { config: configName } });
    // Check if the config exists, else trigger an error
    if (!config) {
      throw new createError(404, 'Client config not found.');
    }
    // Return the data
    return res.status(200).json(config);
  } catch (error) {
    next(error);
  }
});

// Save new config command 
router.post("/:configName", async (req, res, next) => {

});

// → Export Router to App
module.exports = router;