/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    This event is triggers by Discord and does processing of data  */

//require modules
const DataManager = require('../database/DbManager');
const { insertGuild } = require('../database/QueryManager');

module.exports = async (client, guild) => {

    //update general table(s)
    await DataManager.UpdateGuildTable();
    await DataManager.UpdateCustomCommandsTable(guild.id);

    //insert new guild
    await insertGuild(guild);

    return;
}