/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    This event is triggers by Discord and does processing of data  */

//require modules
const DataManager = require('../database/DbManager');
const { insertGuild, getCustomCommands } = require('../database/QueryManager');
const { loadCommandCache, loadGuildPrefixes } = require('../utils/CacheManager');
const { addSlashCommand, addSlashCustomCommand } = require('../utils/ClientManager');

module.exports = async (client, guild) => {

    //update general table(s)
    await DataManager.UpdateGuildTable();
    await DataManager.UpdateCustomCommandsTable(guild.id);

    //insert new guild & activate
    await insertGuild(guild);
    await activateGuild(guild);

    //load guild specific values
    await loadCommandCache(guild);
    await loadGuildPrefixes(guild);

    //get & register client commands
    const clientCommands = client.commands.map(c => c);
    for await (let command of clientCommands) {
        await addSlashCommand(client, guild, command);
    }

    //fetch & register (previous) custom commands
    const customCommands = await getCustomCommands(guild);
    for await (let command of customCommands) {
        await addSlashCustomCommand(client, guild, command);
    }

    return;
}