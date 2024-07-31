const express = require("express");
const router = express.Router({ mergeParams: true });

// Define the routes for the guilds
const { registerIndividualRoute } = require("../../middleware/routes");
registerIndividualRoute("/guilds/:guildId(\\d+)/users", require("./users"));
registerIndividualRoute("/guilds/:guildId(\\d+)/logs", require("./logs"));
registerIndividualRoute("/guilds/:guildId(\\d+)/messages", require("./messages"));
registerIndividualRoute("/guilds/:guildId(\\d+)/economy", require("./economy"));
registerIndividualRoute("/guilds/:guildId(\\d+)/levels", require("./levels"));

module.exports = router;