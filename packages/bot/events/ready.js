/*  FluxBot © 2023 Fluxpuck
This event is triggers by Discord and does processing of data  */

// → require packages & functions
const { join } = require('path');
const { loadCommands } = require("../utils/CommandManager");
const { displayWelcomeMessage } = require('../utils/ConsoleManager');
const { fetchCommands } = require("../lib/commands/clientCommands");

module.exports = async (client) => {

    // Sets the bot's presence to indicate that it is listening to a user with the username 'Fluxpuck#0001'.
    client.user.setPresence({ activities: [{ type: 'LISTENING', name: 'Fluxpuck#0001' }], status: 'online' });

    // Sets the directory path to the folder containing the bot's commands, and loads the commands into memory using the loadCommands function.
    const filePath = join(__dirname, '..', 'commands');
    await loadCommands(client, filePath);

    const API_URL = "/client/commands"
    const commands = await fetchCommands(API_URL);
    const applications = await client.application.commands.fetch();

    for (const command of commands) {
        for (const [key, value] of applications) {
            if (command.commandId === key) {

                const { commandId, commandName, description, interactionType, interactionOptions, private } = command

                await client.application?.commands.edit(commandId, {
                    name: commandName,
                    description: description,
                    type: interactionType,
                    options: interactionOptions,
                    defaultMemberPermissions: [],
                }).then(async (application) => {

                    const commandData = {
                        commandId: application.id,
                        commandName: application.name,
                        private: private,
                        clientId: application.clientId
                    }


          

                });



                console.log("Time to UPDATE the command!", command)
                console.log("clientId", client.id)

            } else if (command.commandName === value.name) {


                // await client.application?.commands.create({
                //     name: command.details.name,
                //     description: command.details.description,
                //     type: command.details.interaction.type,
                //     options: command.details.interaction.options,
                //     defaultMemberPermissions: command.details.interaction.defaultMemberPermissions,
                // }).then(async (application) => {

                //     // Create the command in the database
                //     await postRequest(`/client/command`, {
                //         command: {
                //             commandId: application.id,
                //             commandName: application.name,
                //             private: command.details.private,
                //             clientId: client.id
                //         }
                //     })
                // });

                console.log("Time to MAKE the command!", key, value)

            }
        }
    }

    // Displays a welcome message in the console to indicate that the bot has successfully started up.
    await displayWelcomeMessage(client);
}


