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

    // Set the directory path to the commands directory
    const basePath = process.cwd();
    const directoryPath = path.join(basePath, '/packages/bot/commands');

    // Fetch the list of commands from the directory
    const commandList = await readCommands(directoryPath);
    const commandInfo = commandList.map(command => ({ "commandName": command.commandName }));

    try {
        await Commands.bulkCreate(commandInfo, { updateOnDuplicate: ['commandName'] });
        console.log("\x1b[34m", ` → Bulk created ${commandInfo.length} commands`);
    } catch (error) {
        console.error(`Error bulk creating commands: ${error.message}`);
    }
}