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
const { loadCommandCache } = require('../utils/CacheManager');
const { getCustomCommands } = require('../database/QueryManager');

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

    //check and update all database tables
    const guilds = Array.from(client.guilds.cache.values())
    for await (let guild of guilds) {
        //update client/guild table(s)
        await DataManager.UpdateGuildTable();
        //load guild specific values
        await loadCommandCache(guild);
    }

    //register or update slash commands
    for await (let guild of guilds) {
        await guild.commands.fetch().then(async applicationcommands => {

            //put application names and client command names in arrays
            const commandNames = client.commands.map(c => c.info.command.name); //client commands (files)
            const applicationNames = applicationcommands.map(a => a.name); //application command (guild)
            const customCommands = await getCustomCommands(guild);
            const customNames = customCommands.map(c => c.commandName); //custom commands (database)

            //merge merge client and custom commands, to see if there are any differences
            const MergedCommands = commandNames.concat(customNames)

            //find the new and old commands
            const newCommands = MergedCommands.filter(x => applicationNames.indexOf(x) === -1);
            const oldCommands = applicationNames.filter(e => !MergedCommands.find(a => e === a));

            //register every new command as application
            for await (let command of newCommands) {
                //get client command details
                const commandFile = client.commands.get(command);
                if (commandFile) await ClientManager.addSlashCommand(client, guild, commandFile);
                else { //get custom command details
                    const customFile = customCommands.find(c => c.commandName == command)
                    if (customFile) await ClientManager.addSlashCustomCommand(client, guild, customFile);
                }
            }

            //remove every old command as application
            for await (let command of oldCommands) {
                //get application command details
                const delCommand = applicationcommands.find(a => a.name === command);
                if (delCommand) await ClientManager.delSlashCommand(guild, delCommand);
            }

            //update client commands
            ClientManager.updateSlashCommands(client, guild);
            //update all custom commands
            ClientManager.updateSlashCustomCommands(client, guild);
        })
    }

    //write applications to json
    ClientManager.writeCommandsJSON(client);

    //set client activity
    await ClientManager.setClientActivity(client);

    //finalize with the Console Messages
    ClientConsole.WelcomeMessage();
    ClientConsole.EventMessage(client.events);
    ClientConsole.CommandMessage(client.commands);

    return;
}