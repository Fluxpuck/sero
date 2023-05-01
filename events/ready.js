/*  FluxBot © 2023 Fluxpuck
This event is triggers by Discord and does processing of data  */

// → require packages & functions
const { join } = require('path');
const { loadCommands } = require("../utils/CommandManager");
const { displayWelcomeMessage } = require('../utils/ConsoleManager');
const { removeClientCommand } = require('../utils/InteractionManager');
const { escape } = require('querystring');

module.exports = async (client) => {

    // Sets the bot's presence to indicate that it is listening to a user with the username 'Fluxpuck#0001'.
    client.user.setPresence({ activities: [{ type: 'LISTENING', name: 'Fluxpuck#0001' }], status: 'online' });

    // Sets the directory path to the folder containing the bot's commands, and loads the commands into memory using the loadCommands function.
    const filePath = join(__dirname, '..', 'commands');
    await loadCommands(client, filePath);

    // Create or Update the client interaction commands
    const clientInteractions = await client.application.commands.fetch();
    const clientCommands = await client.commands.values();
    for await (const command of clientCommands) {
        // Find the interaction
        const interaction = clientInteractions.find(interaction => interaction.name === command.details.name);
        if (interaction) { // Update the command
            await client.application?.commands.edit(interaction.id, {
                name: command.details.name,
                description: command.details.description,
                type: command.details.interaction.type,
                options: command.details.interaction.options,
                defaultMemberPermissions: command.details.interaction.defaultMemberPermissions,
            });
        } else { // Create the command
            await client.application?.commands.create({
                name: command.details.name,
                description: command.details.description,
                type: command.details.interaction.type,
                options: command.details.interaction.options,
                defaultMemberPermissions: command.details.interaction.defaultMemberPermissions,
            });
        }
    }

    // Displays a welcome message in the console to indicate that the bot has successfully started up.
    await displayWelcomeMessage(client);

}