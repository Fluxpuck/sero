const { join } = require('path');
const { loadCommands } = require("../utils/CommandManager");
const { getRequest, postRequest } = require('../database/connection');
const events = require('../config/eventEnum');

module.exports = async (client) => {

    // Sets the bot's presence to indicate that it is listening to a user with the username 'Fluxpuck#0001'.
    client.user.setPresence({ activities: [{ type: 'LISTENING', name: 'Fluxpuck#0001' }], status: 'online' });

    // Sets the directory path to the folder containing the bot's commands, and loads the commands into memory using the loadCommands function.
    const filePath = join(__dirname, '..', 'commands');
    await loadCommands(client, filePath);

    // Create Client Application Commands through a seperate event
    client.emit(events.APPLICATION_CREATE);

    // Set global guild active setting
    Array.from(client.guilds.cache.values()).forEach(async guild => {
        // Check if guild is available, else create a new entry
        const guildResult = await getRequest(`/guilds/${guild.id}`);
        if (guildResult?.status === 404) {
            await postRequest(`/guilds/${guild.id}`, {
                guildId: guild.id,
                guildName: guild.name
            })
        }

        // Fetch the guild's settings from the database
        const guildSettings = await getRequest(`/guilds/${guild.id}/settings`);
        if (guildSettings?.status === 200) {
            // Add the guilds settings to the guild object
            guild.guildSettings = guildSettings.data
        }
    });
}