const express = require("express");
const router = express.Router({ mergeParams: true });

// Define the routes for the guilds
const { registerIndividualRoute } = require("../../../middleware/routes");
registerIndividualRoute("/guilds/:guildId(\\d+)/career", require("./career"));

module.exports = router;