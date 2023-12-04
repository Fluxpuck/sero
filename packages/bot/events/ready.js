const { join } = require('path');
const { loadCommands } = require("../utils/CommandManager");
const { fetchConfig } = require('../lib/client/config');
const { displayWelcomeMessage } = require('../utils/ConsoleManager');
const { postRequest, getRequest } = require('../database/connection');
const events = require('../config/eventEnum');
const configFile = require('../config/config.json');

module.exports = async (client) => {

    // Attach config settings to the client
    const clientConfig = await fetchConfig();
    client.config = clientConfig ?? configFile;

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

    // Set global guild active setting
    if (client.config.saveClientGuilds === true) {
        Array.from(client.guilds.cache.values()).forEach(async guild => {
            await postRequest(`/guilds/${guild.id}`, {
                guild: {
                    guildId: guild.id,
                    guildName: guild.name,
                    active: true
                }
            })

            const { data } = await getRequest(`/guilds/${guild.id}`);
            guild.active = data.active === true;
        });
    }
}