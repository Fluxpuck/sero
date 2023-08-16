/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit hyperbot.cc  */

// → Importing necessary modules, functions and classes

// → Constructing the command and exporting
module.exports.run = async (client, interaction) => {


    // client.emit('guildCreate', interaction.guild);
    // client.emit('guildDelete', interaction.guild);

    // client.emit('guildMemberAdd', interaction);
    // client.emit('guildMemberRemove', interaction);

    // Sending the message
    return interaction.reply({
        content: '*Test command executed!*',
        ephemeral: false,
    }).catch((err) => { throw err });
}


// → Exporting the command details
const path = require('path');
module.exports.details = {
    name: 'test',
    directory: path.relative(path.resolve(__dirname, '..'), __dirname),
    description: 'Test command',
    usage: '/test',
    private: true,
    cooldown: 0,
    interaction: {
        type: 1, // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandType
        permissionType: [], // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandPermissionType  
        optionType: [], // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType 
        ephemeral: false,
        modal: false,
        defaultMemberPermissions: ['Administrator']
    }
}