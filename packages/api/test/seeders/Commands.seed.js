const { Commands } = require("../../database/models");
const fs = require('fs').promises;
const path = require('path');

async function isDir(filePath) {
    try {
        const stat = await fs.lstat(filePath);
        return stat.isDirectory();
    } catch (error) {
        console.error(`Error checking if path is directory: ${filePath}`, error);
        return false;
    }
}

async function readCommands(directoryPath) {
    let commandList = [];

    try {
        const files = await fs.readdir(directoryPath);

        for (const file of files) {
            const filePath = path.join(directoryPath, file);

            if (await isDir(filePath)) {
                // Recursively read commands from subdirectories
                const subdirectoryCommands = await readCommands(filePath);
                commandList = commandList.concat(subdirectoryCommands);
            } else if (file.endsWith('.js')) {
                try {
                    const command = require(filePath);
                    if (command && command.props?.commandName) {
                        commandList.push(command.props);
                    }
                } catch (error) {
                    console.error(`Error loading command file: ${filePath}`, error);
                }
            }
        }
    } catch (error) {
        console.error(`Error reading directory: ${directoryPath}`, error);
    }

    return commandList;
}

module.exports.run = async () => {
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
