const { join } = require('path');
const { loadCommands } = require("../utils/CommandManager");
const { postRequest, getRequest } = require('../database/connection');
const events = require('../config/eventEnum');

module.exports = async (client) => {

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
        if (data) guild.active = data?.active === true;

        if (process.env.SAVE_CLIENT_GUILDS === "true") {
            const result = await postRequest(`/guilds/${guild.id}`, {
                guildId: guild.id,
                guildName: guild.name
            })
        }
    });

}