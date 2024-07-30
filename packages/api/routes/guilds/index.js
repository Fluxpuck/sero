const express = require("express");
const router = express.Router({ mergeParams: true });

// Define the routes for the guilds
const { registerIndividualRoute } = require("../../middleware/routes");
registerIndividualRoute("/guilds/:guildId/users", require("./users"));
registerIndividualRoute("/guilds/:guildId/logs", require("./logs"));
registerIndividualRoute("/guilds/:guildId/messages", require("./messages"));
registerIndividualRoute("/guilds/:guildId/economy", require("./economy"));
registerIndividualRoute("/guilds/:guildId/levels", require("./levels"));





module.exports = router;