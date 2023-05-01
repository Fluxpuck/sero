/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    This event is triggers by Discord and does processing of data  */

const { join } = require('path');
const { loadCommands } = require("../utils/CommandManager");

module.exports = async (client) => {

    client.user.setPresence({ activities: [{ type: 'LISTENING', name: 'Fluxpuck#0001' }], status: 'online' });

    const filePath = join(__dirname, '..', 'commands');
    await loadCommands(client, filePath)


    return;
}