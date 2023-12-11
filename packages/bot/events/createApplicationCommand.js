const { PermissionFlagsBits } = require('discord.js');
const { fetchCommands, postCommands } = require("../lib/client/commands");

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
                    const result = await application.delete();
                    console.log(result);
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
                    await client.application?.commands.edit(key, {
                        name: commandName,
                        description: description,
                        type: interactionType,
                        options: interactionOptions,
                        defaultMemberPermissions: [PermissionFlagsBits.KickMembers],
                    }).then(async (application) => {

                        console.log(`Application Updated: ${application.name} | ${application.id}`)

                        const result = await postCommands(application.name, {
                            commandId: application.id,
                            commandName: application.name,
                            description: description,
                            usage: usage,
                            interactionType: interactionType,
                            interactionOptions: interactionOptions,
                            private: private,
                        });
                        console.log(result);

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
                }).then(async (application) => {

                    console.log(`Application Created: ${application.name} | ${application.id}`)

                    const result = await postCommands(application.name, {
                        commandId: application.id,
                        commandName: application.name,
                        description: description,
                        usage: usage,
                        interactionType: interactionType,
                        interactionOptions: interactionOptions,
                        private: private,
                    });

                    console.log(result);

                }).catch((error) => {
                    console.error(`[Error creating (${commandName})]: `, error);
                });
            }
        }
    }
}