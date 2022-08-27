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
const { loadGuildPrefixes } = require('../database/QueryManager');

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
        await loadGuildPrefixes(guild);
    }

    //register or update slash commands
    for await (let guild of guilds) {
        await guild.commands.fetch().then(async applicationcommands => {
            //add new applications, if there are new client commands
            if (client.commands.size != applicationcommands.size) {
                //put application names and client command names in arrays
                const commandNames = client.commands.map(c => c.info.command.name);
                const applicationNames = applicationcommands.map(a => a.name);
                //find the new and old commands
                const newCommands = commandNames.filter(x => applicationNames.indexOf(x) === -1);
                const oldCommands = applicationNames.filter(e => !commandNames.find(a => e === a));

                //register every new command as application
                for await (let command of newCommands) {
                    //get client command details
                    const commandFile = client.commands.get(command);
                    await ClientManager.addSlashCommand(client, guild, commandFile);
                }

                //remove every old command as application
                for await (let command of oldCommands) {
                    //get application command details
                    const delCommand = applicationcommands.filter(a => a.name === command);
                    await ClientManager.delSlashCommand(guild, delCommand);
                }

            }
            if (applicationcommands.size <= 0) ClientManager.setSlashCommands(client, guild); //register all guild applications, if none were present
            else ClientManager.updateSlashCommands(client, guild); //update all guild applications, if guild already has applications
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