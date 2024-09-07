const { PermissionFlagsBits } = require('discord.js');
const { fetchCommands, postCommands, deleteCommands } = require("../lib/client/commands");

module.exports = async (client) => {

    // Fetch all application commands from the application
    const applications = await client.application.commands.fetch();
    // Get all the client commands
    const clientCommands = Array.from(client.commands);

    // Iterate over the client commands
    for await (const [commandName, value] of clientCommands) {

        // Get the command properties
        const command = value.props;

        // Find the application command
        const application = applications.find(app => app.name === commandName);
        if (!application) {

            /**
             * Create new application command
             * Create the command in the database
             * @command - The application command details
             */
            await client.application?.commands.create({
                name: command.commandName,
                description: command.description,
                type: command.interactionType,
                options: command.interactionOptions,
                defaultMemberPermissions: command.defaultMemberPermissions,
            }).then(async (application) => {

                // Log the application creation
                console.log("\x1b[36m", `[Client]: ${application.name} created successfully.`);

                // POST the command to the database
                const result = await postCommands(application.name, {
                    commandId: application.id,
                    commandName: application.name,
                    description: command.description,
                    usage: command.usage,
                    type: command.interactionType,
                    options: command.interactionOptions,
                    defaultMemberPermissions: command.defaultMemberPermissions,
                    private: command.private,
                    cooldown: command.cooldown ? command.cooldown : null,
                })

                if (process.env.NODE_ENV === "development") {
                    console.log("\x1b[2m", `[Database]: ${result.message}`);
                }

            }).catch((error) => {
                console.error(`[Error]: Something went wrong trying to create an application for ${command.commandName}`, error);
            });
        } else {

            /**
             * Update application command
             * Update the command in the database
             * @command - The application command details
             */
            await application.edit({
                name: command.commandName,
                description: command.description,
                type: command.interactionType,
                options: command.interactionOptions,
                defaultMemberPermissions: command.defaultMemberPermissions,
            }).then(async (application) => {

                // Log the application update
                console.log("\x1b[34m", `[Client]: ${application.name} updated successfully.`);

                // POST the command to the database
                const result = await postCommands(application.name, {
                    commandId: application.id,
                    commandName: application.name,
                    description: command.description,
                    usage: command.usage,
                    type: command.interactionType,
                    options: command.interactionOptions,
                    defaultMemberPermissions: command.defaultMemberPermissions,
                    private: command.private,
                    cooldown: command.cooldown ? command.cooldown : null,
                })

                if (process.env.NODE_ENV === "development") {
                    console.log("\x1b[2m", `[Database]: ${result.message}`);
                }

            }).catch((error) => {
                console.error(`[Error]: Something went wrong trying to update the application ${command.commandName}`, error);
            });

        }
    }

    // Iterate over the application commands
    for await (const [key, application] of applications) {

        // Find the client command
        const command = client.commands.get(application.name);
        if (!command) {

            // Delete the command from the application
            await application.delete(key).then(async (application) => {

                // Delete the command from the database
                const result = await deleteCommands(application.name)

                if (process.env.NODE_ENV === "development") {
                    console.log("\x1b[2m", `[Database]: ${result.message}`);
                }

            }).catch((error) => {
                console.error(`[Error]: Something went wrong trying to delete the application ${application.name}`, error);
            });

        }
    }
}