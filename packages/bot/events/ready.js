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
        // Fetch the guild from the database
        const result = await getRequest(`/guilds/${guild.id}`);
        // Set the guild's active status to true
        if (result?.status === 200) {
            guild.active = result?.data?.active === true;
        }
        // If the guild is not found in the database, create a new entry for the guild
        if (result?.status === 404) {
            await postRequest(`/guilds/${guild.id}`, {
                guildId: guild.id,
                guildName: guild.name
            })
        }
    });

}