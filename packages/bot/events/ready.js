const { join } = require('path');
const { loadCommands } = require("../utils/CommandManager");
const { displayWelcomeMessage } = require('../utils/ConsoleManager');
const events = require('../config/eventEnum');
const config = require('../config/config.json');

module.exports = async (client) => {

    // Attach config settings to the client
    client.config = config;

    // Sets the bot's presence to indicate that it is listening to a user with the username 'Fluxpuck#0001'.
    client.user.setPresence({ activities: [{ type: 'LISTENING', name: 'Fluxpuck#0001' }], status: 'online' });

    // Sets the directory path to the folder containing the bot's commands, and loads the commands into memory using the loadCommands function.
    const filePath = join(__dirname, '..', 'commands');
    await loadCommands(client, filePath);

    // Create Client Application Commands through a seperate event
    const applications = await client.application.commands.fetch();
    client.emit(events.CREATE_APPLICATION_COMMAND, applications);

    // Displays a welcome message in the console to indicate that the bot has successfully started up.
    await displayWelcomeMessage(client);
}