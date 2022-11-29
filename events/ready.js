/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    This event is triggers by Discord and does processing of data  */

//load required modules
const { join } = require('path');
const commandFolder = join(__dirname, '..', 'commands');

//require Managers
const ClientConsole = require('../utils/ConsoleManager');
const ClientManager = require('../utils/ClientManager');
const CacheManager = require('../utils/CacheManager');
const DataManager = require('../database/DbManager');

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

    //fetch all guild (custom) application commands & map command names
    const clientApplicationsCommands = await client.application.commands.fetch();
    const clientApplicationNames = clientApplicationsCommands.map(a => a.name);

    //set client command names
    const clientCommandNames = client.commands.map(c => c.info.command.name);

    //find the new and old commands
    const newClientCommands = clientCommandNames.filter(x => clientApplicationNames.indexOf(x) === -1);
    const oldClientCommands = clientApplicationNames.filter(e => !clientCommandNames.find(a => e === a));

    //register all new commands
    for (let command of newClientCommands) {
        const clientFile = client.commands.find(c => c.commandName == command.substring(1))
        if (clientFile) await ClientManager.addClientCommand(client, customFile);
    }

    //remove old commands
    for (let command of oldClientCommands) {
        //get application command details
        const delCommand = client.commands.find(a => a.name === command);
        if (delCommand) await ClientManager.deleteClientCommand(guild, delCommand);
    }

    //add all client commands
    for (let command of client.commands.values()) {
        //if client application command does not exist, add
        if (!clientApplicationNames.includes(command.info.command.name)) {
            ClientManager.addClientCommand(client, command)
        }
    }

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
        await DataManager.UpdateApplicationBLTable();
        //load guild specific values
        await CacheManager.loadCustomCommands(guild);
        await CacheManager.loadGuildPrefixes(guild);
        await CacheManager.loadGuildApplyChannel(guild);
    }

    //register or update slash commands
    for await (let guild of guilds) {

        //fetch all guild (custom) application commands & map command names
        const guildApplicationsCommands = await guild.commands.fetch();
        const guildApplicationNames = guildApplicationsCommands.map(a => a.name);

        //add all guild applications to guild collection
        guild.applicationCommands = guildApplicationsCommands;

        //fetch all custom commands & map command names
        const customCommands = await CacheManager.getCustomCommands(guild);
        const customNames = customCommands.map(c => `${guild.prefix}${c.commandName}`); //add prefix to commands for proper filtering

        //find the new and old commands
        const newGuildCommands = customNames.filter(x => guildApplicationNames.indexOf(x) === -1);
        const oldGuildCommands = guildApplicationNames.filter(e => !customNames.find(a => e === a));

        //register all new commands
        for (let command of newGuildCommands) {
            //get custom command details
            const customFile = customCommands.find(c => c.commandName == command.substring(1))
            if (customFile) await ClientManager.addCustomCommand(client, guild, customFile);
        }

        //remove old commands
        for (let command of oldGuildCommands) {
            //get application command details
            const delCommand = guildApplicationNames.find(a => a.name === command);
            if (delCommand) await ClientManager.deleteGuildCommand(guild, delCommand);
        }
    }

    return;
}