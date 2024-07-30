const express = require("express");
const router = express.Router();

// Load the routes from the current directory
const { registerBaseRoutes } = require("../../middleware/routes");
registerBaseRoutes(router, __dirname, "/client");

module.exports = router;