/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit hyperbot.cc  */

// → Constructing the command and exporting
module.exports.run = async (client, interaction) => {

    // Set timer for message reply
    const wait = require('node:timers/promises').setTimeout;
    await wait(800); //wait before giving a reply

    // Reply with Discord Latency
    return interaction.reply(`Pong! → \ ${Math.round(client.ws.ping)}ms`)
}


// → Exporting the command details
const path = require('path');
module.exports.details = {
    name: 'ping',
    directory: path.relative(path.resolve(__dirname, '..'), __dirname),
    description: 'Check the bot\'s latency',
    usage: '/ping',
    private: false,
    cooldown: 0,
    interaction: {
        type: 1, // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandType
        permissionType: [], // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandPermissionType  
        optionType: [], // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType 
        ephemeral: false,
        modal: false,
        defaultMemberPermissions: []
    }
}