const express = require("express");
const router = express.Router();

const { loadRoutes } = require("../../middleware/routes");
loadRoutes(router, __dirname, "/guilds");

module.exports = router;