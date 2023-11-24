const { join } = require('path');
const { loadCommands } = require("../utils/CommandManager");
const { displayWelcomeMessage } = require('../utils/ConsoleManager');
const { postRequest, getRequest } = require('../database/connection');
const events = require('../config/eventEnum');
const config = require('../config/config.json');

module.exports = async (client) => {

    // Attach config settings to the client
    // @TODO: Put these config settings in the database
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

    // Set global guild active setting
    Array.from(client.guilds.cache.values()).forEach(async guild => {
        if (client.config.saveClientGuilds === true) {
            await postRequest(`/guilds/${guild.id}`, {
                guild: {
                    guildId: guild.id,
                    guildName: guild.name,
                    active: false
                }
            })
        }

        const { data } = await getRequest(`/guilds/${guild.id}`);
        guild.active = data.active === true;
    });

}