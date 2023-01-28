/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    This event is triggers by Discord and does processing of data  */

//require modules
const DataManager = require('../database/DbManager');
const { insertGuild } = require('../database/QueryManager');
const { loadCustomCommands, loadGuildPrefixes, getCustomCommands } = require('../utils/CacheManager');
const { addCustomCommand } = require('../utils/ClientManager');

module.exports = async (client, guild) => {

    //update general table(s)
    await DataManager.UpdateGuildTable();
    await DataManager.UpdateCustomCommandsTable(guild.id);

    //insert new guild & activate
    await insertGuild(guild);

    //load guild specific values
    await loadCustomCommands(guild);
    await loadGuildPrefixes(guild);

    //re-create guild application commands
    const customCommands = await getCustomCommands(guild);
    for await (let command of customCommands) {
        await addCustomCommand(client, guild, command);
    }

    return;
}