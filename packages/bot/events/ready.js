const { join } = require('path');
const { loadCommands } = require("../utils/CommandManager");
const { fetchConfig } = require('../lib/client/config');
const { postRequest, getRequest } = require('../database/connection');
const events = require('../config/eventEnum');
const configFile = require('../config/config.json');

module.exports = async (client) => {

    // Attach config settings to the client
    const clientConfig = await fetchConfig();
    client.config = clientConfig || Object.keys(clientConfig).length === 0 ? configFile : clientConfig;

    // Sets the bot's presence to indicate that it is listening to a user with the username 'Fluxpuck#0001'.
    client.user.setPresence({ activities: [{ type: 'LISTENING', name: 'Fluxpuck#0001' }], status: 'online' });

    // Sets the directory path to the folder containing the bot's commands, and loads the commands into memory using the loadCommands function.
    const filePath = join(__dirname, '..', 'commands');
    await loadCommands(client, filePath);

    // Create Client Application Commands through a seperate event
    const applications = await client.application.commands.fetch();
    client.emit(events.APPLICATION_CREATE, applications);

    // Displays a welcome message in the console to indicate that the bot has successfully started up.
    console.log(`
     _______ _______ _______   _______ 
    |       |       |    _  \\ |       |
    |  _____|    ___|   | |  ||   _   |
    | |_____|   |___|   |_| /_|  | |  |
    |_____  |    ___|    __   |  |_|  |
     _____| |   |___|   |  |  |       |
    |_______|_______|___|  |__|_______|

    Discord bot - Startup details:
    > ${new Date().toUTCString()}
    > NODE_ENV: ${process.env.NODE_ENV}
    > ${client.user.tag}
`);

    // Set global guild active setting
    Array.from(client.guilds.cache.values()).forEach(async guild => {
        const { data } = await getRequest(`/guilds/${guild.id}`);
        if (data) guild.active = data[0]?.active === true;

        if (client.config.saveClientGuilds === true) {
            await postRequest(`/guilds/${guild.id}`, {
                guildId: guild.id,
                guildName: guild.name,
                active: false
            })
        }
    });

}