/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    This event is triggers by Discord and does processing of data  */

//require modules
const { removeSlashCommands } = require("../utils/ClientManager");

module.exports = async (client, guild) => {

    removeSlashCommands(guild);

    return;
}