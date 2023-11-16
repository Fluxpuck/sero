const { fetchCommands, postCommands } = require("../lib/commands/clientCommands");

module.exports = async (client, application) => {
    const commands = await fetchCommands();
    if (!commands) return;

    const applications = await client.application.commands.fetch();

    for (const command of commands) {
        for (const [key, value] of applications) {

            const { commandId, commandName, description, usage, interactionType, interactionOptions, private } = command

            if (command.commandId === key) {
                // Update the existing client application command
                await client.application?.commands.edit(commandId, {
                    name: commandName,
                    description: description,
                    type: interactionType,
                    options: interactionOptions,
                    defaultMemberPermissions: [],
                }).then((application) => {
                    postCommands(application.id, {
                        commandId: application.id,
                        commandName: application.name,
                        description: description,
                        usage: usage,
                        private: private,
                        clientId: client.user.id
                    });
                }).catch((error) => {
                    console.error('Error editing command:', error);
                });

            } else if (command.commandName === value.name) {
                // Create a new client application command
                await client.application?.commands.create({
                    name: commandName,
                    description: description,
                    type: interactionType,
                    options: interactionOptions,
                    defaultMemberPermissions: [],
                }).then((application) => {
                    postCommands(application.id, {
                        commandId: application.id,
                        commandName: application.name,
                        description: description,
                        usage: usage,
                        private: private,
                        clientId: client.user.id
                    });
                }).catch((error) => {
                    console.error('Error creating command:', error);
                });

            }
        }
    }
}