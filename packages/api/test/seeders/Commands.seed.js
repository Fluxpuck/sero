const { Commands } = require("../../database/models");
const fs = require('fs');
const path = require('path');

function isDir(filePath) {
    // Check if the path exists and is a directory.
    // Returns true if both conditions are met, false otherwise.
    return (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory())
}

async function readCommands(directoryPath) {
    const files = fs.readdirSync(directoryPath);
    let commandList = [];

    // iterate over files array
    for (const file of files) {
        const filePath = path.join(directoryPath, file);

        if (isDir(filePath)) {
            // If the file is a directory, call the function recursively with the subdirectory path
            const subdirectoryCommands = await readCommands(filePath);
            commandList = commandList.concat(subdirectoryCommands);
        } else if (file.endsWith(".js")) {
            // If the file is a JavaScript file, load the command from the file
            const command = require(filePath);

            if (command && command.props?.commandName) {
                commandList.push(command.props);
            }
        }
    }

    return commandList;
}

module.exports.run = async () => {

    const basePath = process.cwd();
    const directoryPath = path.join(basePath, '/packages/bot/commands');
    const commandList = await readCommands(directoryPath);

    for (const commandInfo of commandList) {
        try {
            // Check if the command already exists
            const existingCommand = await Commands.findOne({
                where: { commandName: commandInfo.commandName },
            });

            if (existingCommand) {
                // Command already exists, update its data
                await existingCommand.update(commandInfo);
            } else {
                // Command doesn't exist, create a new record
                await Commands.create(commandInfo);
            }
        } catch (error) {
            console.error(`Error creating/updating command: ${error.message}`);
        }
    }
}