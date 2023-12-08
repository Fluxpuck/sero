const express = require("express");
const router = express.Router();
const { Reasons } = require("../database/models");
const { sequelize } = require('../database/sequelize');
const { createError } = require('../utils/ClassManager');

// → Define the routes for 'api/reasons'
// Get all reasons
router.get("/", async (req, res, next) => {
  try {
    //find all reasons
    const reasons = await Reasons.findAll({
      where: { guildId: null },
    });
    //check for any client config, else trigger error
    if (!reasons) throw new createError(404, 'No client reasons found.');
    // return data
    return res.status(200).json(reasons);
  } catch (error) {
    next(error);
  }
});

// Get reasons from a specific type
router.get("/:type", async (req, res, next) => {

});

// Get reasons for a specific type from a specific guild
router.get("/:type/:guildId", async (req, res, next) => {

});

// Get reasons from a specific guild
router.get("/guild/:guildId", async (req, res, next) => {

});

// Save new config command 
router.post("/", async (req, res, next) => {

});

// → Export Router to App
module.exports = router;