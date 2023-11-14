/*  FluxBot © 2023 Fluxpuck
The CommandManager contains functions to set client commands from files */

// → require packages & functions
const fs = require('fs');
const { join, resolve } = require('path');

// This function checks if a given path is a directory.
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
        for (const file of files) {

            // get the full path of the file
            const filePath = join(directoryPath, file);

            // Check if the file is a directory or a file
            if (isDir(filePath)) {

                // If the file is a directory, call the function recursively with the subdirectory path
                await module.exports.loadCommands(client, filePath);

            } else if (file.endsWith(".js")) {

                // If the file is a JavaScript file, load the command from the file
                const command = require(filePath);

                if (command && command.props?.name) {

                    // Set the command in the client's collection
                    client.commands.set(command.props.name, command);

                }
            }
        }
    }

}