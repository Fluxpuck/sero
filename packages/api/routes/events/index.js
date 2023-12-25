const express = require('express');
const router = express.Router();
const { EventChannels } = require("../../database/models");
const { sequelize } = require('../../database/sequelize');
const { CreateError } = require('../../utils/ClassManager');
const { validateParams, validateData } = require('../../utils/FunctionManager');


/**
 * @router GET api/events
 * @description Get all Events
 */


/*
 @TODO: this will be the API endpoint for getting, setting and deleting eventchannels 
 */

// → Export Router to App
module.exports = router;