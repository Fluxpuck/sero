const express = require("express");
const { Op } = require('sequelize');
const router = express.Router({ mergeParams: true });

const { User, UserLevels } = require("../../../database/models");
const { findAllRecords, findOneRecord, createOrUpdateRecord } = require("../../../utils/RequestManager");




module.exports = router;