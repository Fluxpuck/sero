const { join } = require('path');
const { loadCommands } = require("../utils/CommandManager");
const { getRequest } = require('../database/connection');
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

    // Set global guild active setting
    Array.from(client.guilds.cache.values()).forEach(async guild => {
        const { data } = await getRequest(`/guilds/${guild.id}`);
        if (data) guild.active = data?.active === true;
    });

}