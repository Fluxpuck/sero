/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit hyperbot.cc  */

// → Importing necessary modules, functions and classes
const { ActionRowBuilder } = require('discord.js');

// → Import styling elements
const { invite } = require('../../assets/embed-buttons')

// → Constructing the command and exporting
module.exports.run = async (client, interaction) => {

    // Construct invite button
    const invite_button = new ActionRowBuilder()
        .addComponents(invite);

    // Send the message
    return interaction.editReply({
        content: `Invite me to your server! \n Created with ❤️ by \`Fluxpuck#0001\``,
        components: [invite_button]
    })

    return;
}


// → Exporting the command details
const path = require('path');
module.exports.details = {
    name: 'invite',
    directory: path.relative(path.resolve(__dirname, '..'), __dirname),
    description: 'Invite the bot to your server',
    usage: '/invite',
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