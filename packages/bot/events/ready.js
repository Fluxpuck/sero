const { join } = require("path");
const { loadCommands } = require("../utils/CommandManager");
const events = require("../config/eventEnum");

module.exports = async (client) => {
  // Sets the bot's presence to indicate that it is listening to a user with the username 'Fluxpuck#0001'.
  client.user.setPresence({
    activities: [{ type: "LISTENING", name: "Fluxpuck#0001" }],
    status: "online",
  });

  // Sets the directory path to the folder containing the bot's commands, and loads the commands into memory using the loadCommands function.
  const filePath = join(__dirname, "..", "commands");
  await loadCommands(client, filePath);

  // Manage utility to handle creating, updating and removing application commands
  client.emit(events.DEPLOY_COMMANDS);
};
