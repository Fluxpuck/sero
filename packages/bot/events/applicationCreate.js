const { PermissionFlagsBits } = require('discord.js');
const { fetchCommands, postCommands, deleteCommands } = require("../lib/client/commands");

module.exports = async (client, applications) => {

    // Fetch all application commands from the Database
    const databaseCommands = await fetchCommands();
    if (!databaseCommands) return;

    // Check if the database command is in the client.commands
    // If not, delete the command from the database
    for await (const command of databaseCommands) {
        if (!client.commands.has(command.commandName)) {

            // Delete the command from the database
            const result = await deleteCommands(command.commandName)
            if (process.env.NODE_ENV === "development") {
                console.log("Command not found. Deleting from the database", result);
            }

            // Slice the command from the databaseCommands array
            const index = databaseCommands.indexOf(command);
            databaseCommands.splice(index, 1);

        }
    }

    // If the application command is not in the databaseCommands
    // Delete the command from the application
    for await (const [key, value] of applications) {
        if (!databaseCommands.find(command => command.commandName === value.name)) {

            // Delete the command from the application
            const result = await client.application.commands.delete(key);
            if (process.env.NODE_ENV === "development") {
                console.log("Command not found. Deleting from the application", result);
            }

        }
    }

    // Check if the command in the database has a commandId
    // If a commandId is found, update the application command
    // Else create a new application command and update the database
    for (const command of databaseCommands) {

        // Check if the application has the commandName
        const hasCommandId = command.commandId !== undefined && command.commandId !== null;
        const hasCommandName = Array.from(applications.values()).some(app => app.name === command.commandName)

        // Check if the command has a commandId
        // If not, create a new command in the application
        // And update the database
        if (!hasCommandId || !hasCommandName) {

            // CREATE new application command
            await client.application?.commands.create({
                name: command.commandName,
                description: command.description,
                type: command.interactionType,
                options: command.interactionOptions,
                defaultMemberPermissions: command.defaultMemberPermissions,
            }).then(async (application) => {
                // Log the application creation
                console.log("\x1b[36m", `[Client]: ${application.name} created successfully.`);

                // POST the command to the database to add the commandId 
                const result = await postCommands(application.name, {
                    commandId: application.id,
                    commandName: application.name,
                    description: command.description,
                    usage: command.usage,
                    type: command.interactionType,
                    options: command.interactionOptions,
                    defaultMemberPermissions: command.defaultMemberPermissions,
                    private: command.private,
                })

                if (process.env.NODE_ENV === "development") {
                    console.log("\x1b[2m", `[Database]: ${result}`);
                }

            }).catch((error) => {
                console.error(`[Error]: Something went wrong trying to create an application for ${command.commandName}`, error);
            });

        } else {

            // EDIT existing application command
            await client.application?.commands.edit(command.commandId, {
                name: command.commandName,
                description: command.description,
                type: command.interactionType,
                options: command.interactionOptions,
                defaultMemberPermissions: command.defaultMemberPermissions,
            }).then(async (application) => {
                // Log the application update
                console.log("\x1b[34m", `[Client]: ${application.name} updated successfully.`);

            }).catch((error) => {
                console.error(`[Error]: Something went wrong trying to update the application ${command.commandName}`, error);
            });

        }
    }
}