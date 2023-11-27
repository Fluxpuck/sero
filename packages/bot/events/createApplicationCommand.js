const { PermissionFlagsBits } = require('discord.js');
const { fetchCommands, postCommands } = require("../lib/commands/clientCommands");

module.exports = async (client, applications) => {
    const commands = await fetchCommands();
    if (!commands) return;

    // Refresh all unused commands
    if (client.config?.applicationRefresh === true) {
        for (const [commandId, { name }] of applications) {

            const commandMismatch = !commands.some(command => command.commandName === name);

            if (commandMismatch) {
                const application = applications.get(commandId);
                try {
                    console.log("Delete Application: " + application.name);
                    application.delete();
                } catch (error) {
                    console.log(error)
                }
            }

        }
    }

    // Create or Update application commands
    if (client.config?.applicationInitialize === true) {
        for (const command of commands) {
            const commandKey = command.commandId || command.commandName;

            const applicationMatch = Array.from(applications.entries()).find(([key, value]) => commandKey === key || commandKey === value.name);

            if (applicationMatch) {
                const [key, value] = applicationMatch;
                const { commandId, commandName, description, usage, interactionType, interactionOptions, private } = command;

                if (commandId === key || commandName === value.name) {
                    await client.application?.commands.edit(commandId, {
                        name: commandName,
                        description: description,
                        type: interactionType,
                        options: interactionOptions,
                        defaultMemberPermissions: [PermissionFlagsBits.KickMembers],
                    }).then((application) => {
                        console.log("Updated Application: " + application.name);

                        postCommands(application.name, {
                            commandId: application.id,
                            commandName: application.name,
                            interactionType: interactionType,
                            interactionOptions: interactionOptions,
                            description: description,
                            usage: usage,
                            private: private,
                            clientId: client.user.id
                        });
                    }).catch((error) => {
                        console.error(`[Error editing (${commandName})]: `, error);
                    });
                }
            } else {
                const { commandName, description, usage, interactionType, interactionOptions, private } = command;

                await client.application?.commands.create({
                    name: commandName,
                    description: description,
                    type: interactionType,
                    options: interactionOptions,
                    defaultMemberPermissions: [PermissionFlagsBits.KickMembers],
                }).then((application) => {
                    console.log("Created Application: " + application.name);

                    postCommands(application.name, {
                        commandId: application.id,
                        commandName: application.name,
                        interactionType: interactionType,
                        interactionOptions: interactionOptions,
                        description: description,
                        usage: usage,
                        private: private,
                        clientId: client.user.id
                    });
                }).catch((error) => {
                    console.error(`[Error creating (${commandName})]: `, error);
                });
            }
        }
    }
}