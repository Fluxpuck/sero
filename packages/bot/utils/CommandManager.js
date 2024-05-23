const fs = require('fs');
const { join, dirname, basename } = require('path');
const { postCommands } = require('../lib/client/commands');

function isDir(filePath) {
    // Check if the path exists and is a directory.
    // Returns true if both conditions are met, false otherwise.
    return (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory())
}

module.exports = {
    /**
     * This function reads command files from a specified directory,
     * and stores them in a client.commands object for reference.
     * @param {*} client 
     * @param {*} dirPath 
     */
    async loadCommands(client, directoryPath) {

        // Get the list of files and directories in the directory
        const files = fs.readdirSync(directoryPath);

        // iterate over files array
        for await (const file of files) {

            // get the full path of the file
            const filePath = join(directoryPath, file);
            const directoryCategory = basename(dirname(filePath));

            // Check if the file is a directory or a file
            if (isDir(filePath)) {

                // If the file is a directory, call the function recursively with the subdirectory path
                await module.exports.loadCommands(client, filePath);

            } else if (file.endsWith(".js")) {

                // If the file is a JavaScript file, load the command from the file
                const command = require(filePath);
                if (command) {

                    // Add the directoryCategory to the props
                    command.props.category = directoryCategory;

                    // Set the command in the client's collection
                    client.commands.set(command.props.commandName, command);

                    // Post the command to the database
                    const { commandName, description, usage, defaultMemberPermissions } = command.props;
                    const { type = 1, options } = command.props?.interaction;
                    postCommands(command.props.commandName, {
                        commandName: commandName,
                        description: description,
                        usage: usage,
                        interactionType: type,
                        interactionOptions: options,
                        defaultMemberPermissions: defaultMemberPermissions,
                    });

                    // Log the command to the console if in development mode
                    if (process.env.NODE_ENV === "development") {
                        console.log(`Post ${commandName} to database.`);
                    }

                }
            }
        }
    }
}