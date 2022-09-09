/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    This event is triggers by Discord and does processing of data  */

//load required modules
const { join } = require('path');
const commandFolder = join(__dirname, '..', 'commands');

//require Managers
const ClientConsole = require('../utils/ConsoleManager');
const ClientManager = require('../utils/ClientManager');
const DataManager = require('../database/DbManager');

//require Queries
const { loadCommandCache, loadGuildPrefixes } = require('../utils/CacheManager');
const { getCustomCommands } = require('../database/QueryManager');
const { Console } = require('console');

//exports "ready" event
module.exports = async (client) => {

    //find all client commandfiles
    async function fileLoader(fullFilePath) {
        if (fullFilePath.endsWith(".js")) {
            let props = require(fullFilePath)
            client.commands.set(props.info.command.name, props)
        }
    }

    //get and initialize client commands
    await ClientManager.getClientCommands(commandFolder, { dealerFunction: fileLoader })

    //write applications to json
    ClientManager.writeCommandsJSON(client);

    //set client activity
    await ClientManager.setClientActivity(client);

    //finalize with the Console Messages
    ClientConsole.WelcomeMessage();
    ClientConsole.EventMessage(client.events);
    ClientConsole.CommandMessage(client.commands);

    //check and update all database tables
    const guilds = Array.from(client.guilds.cache.values())
    for await (let guild of guilds) {
        //update client/guild table(s)
        await DataManager.UpdateGuildTable();
        //load guild specific values
        await loadCommandCache(guild);
        await loadGuildPrefixes(guild);
    }

    //register or update slash commands
    for await (let guild of guilds) {

        //get all current Application Commands & map command names
        const applicationsCommands = await guild.commands.fetch();
        guild.applicationCommands = applicationsCommands; //add commands to guild collection
        const applicationNames = applicationsCommands.map(a => a.name);
        //get all client command & map command names
        const commandNames = client.commands.map(c => c.info.command.name);
        //fetch all custom commands & map command names
        const customCommands = await getCustomCommands(guild);
        const customNames = customCommands.map(c => `${guild.prefix}${c.commandName}`); //add prefix to commands for proper filtering

        //merge client and custom commands, to see if there are any differences
        const mergedCommands = commandNames.concat(customNames);
        //find the new and old commands
        const newCommands = mergedCommands.filter(x => applicationNames.indexOf(x) === -1);
        const oldCommands = applicationNames.filter(e => !mergedCommands.find(a => e === a));

        //register all new commands
        for (let command of newCommands) {
            //get client command details
            const commandFile = client.commands.get(command);
            if (commandFile) await ClientManager.addSlashCommand(client, guild, commandFile);
            else {
                //get custom command details
                const customFile = customCommands.find(c => c.commandName == command.substring(1))
                if (customFile) await ClientManager.addSlashCustomCommand(client, guild, customFile);
            }
        }

        //remove old commands
        for (let command of oldCommands) {
            //get application command details
            const delCommand = applicationsCommands.find(a => a.name === command);
            if (delCommand) await ClientManager.delSlashCommand(guild, delCommand);
        }

        // //update all current commands
        // for await (let command of applicationsCommands.values()) {
        //     //check if client command or custom commands...
        //     if (commandNames.includes(command.name)) {
        //         await ClientManager.updateSlashCommand(client, guild, command)
        //     }
        //     if (customNames.includes(command.name)) {
        //         const commandDetails = customCommands.find(c => c.commandName == command.name.substring(1))
        //         await ClientManager.updateSlashCustomCommand(client, guild, commandDetails, command)
        //     }
        // }

    }

    return;
}