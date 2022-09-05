/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    This event is triggers by Discord and does processing of data  */

//require modules
const DataManager = require('../database/DbManager');
const { insertGuild, getCustomCommands } = require('../database/QueryManager');
const { addSlashCommand, addSlashCustomCommand } = require('../utils/ClientManager');

module.exports = async (client, guild) => {

    //update general table(s)
    await DataManager.UpdateGuildTable();
    await DataManager.UpdateCustomCommandsTable(guild.id);

    //insert new guild
    await insertGuild(guild);

    //get & register client commands
    const clientCommands = client.commands.map(c => c);
    for await (let command of clientCommands) {
        addSlashCommand(client, guild, command);
    }

    //fetch & register (previous) custom commands
    const customCommands = await getCustomCommands(guild);
    for await (let command of customCommands) {
        addSlashCustomCommand(client, guild, command);
    }

    return;
}