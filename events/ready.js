/*  FluxBot © 2023 Fluxpuck
This event is triggers by Discord and does processing of data  */

// → require packages & functions
const { join } = require('path');
const { loadCommands, getAllCommands } = require("../utils/CommandManager");
const { displayWelcomeMessage } = require('../utils/ConsoleManager');
const { removeClientCommand } = require('../utils/InteractionManager');
const { postRequest } = require('../database/connection');

module.exports = async (client) => {

    // Save all commands in a json file
    getAllCommands();

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

            console.log(`updating command ${command.details.name}`);

            await client.application?.commands.edit(interaction.id, {
                name: command.details.name,
                description: command.details.description,
                type: command.details.interaction.type,
                options: command.details.interaction.options,
                defaultMemberPermissions: command.details.interaction.defaultMemberPermissions,
            }).then(async (application) => {

                // Update the command in the database
                await postRequest(`/client/command`, {
                    command: {
                        commandId: application.id,
                        commandName: application.name,
                        private: command.details.private,
                    }
                })

            });
        } else { // Create the command

            console.log(`creating command ${command.details.name}`);

            await client.application?.commands.create({
                name: command.details.name,
                description: command.details.description,
                type: command.details.interaction.type,
                options: command.details.interaction.options,
                defaultMemberPermissions: command.details.interaction.defaultMemberPermissions,
            }).them(async (application) => {

                // Create the command in the database
                await postRequest(`/client/command`, {
                    command: {
                        commandId: application.id,
                        commandName: application.name,
                        private: command.details.private,
                    }
                })
            });
        }
    }

    // Displays a welcome message in the console to indicate that the bot has successfully started up.
    await displayWelcomeMessage(client);

}