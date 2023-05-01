/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit hyperbot.cc  */

// → Import assetts and configurations
const embed = require('../assets/embed.json');

// → Importing necessary modules, functions and classes
const { EmbedBuilder, version: discordVersion } = require('discord.js');
const { version: botVersion } = require('../package.json');
const { formatTime } = require('../lib/time/formattime');

// Constructing the command and exporting
module.exports.run = async (client, interaction) => {

    // Setting up the embedded message
    const messageEmbed = new EmbedBuilder()
        .setTitle('FluxBot')
        .setDescription('FluxBot is a Discord bot written in JavaScript using the Discord.js library.')
        .addFields(
            { name: 'Version', value: botVersion, inline: true },
            { name: 'Discord.js', value: discordVersion, inline: true },
            { name: 'Uptime', value: formatTime(client.uptime), inline: true }
        )


        .setThumbnail(client.user.displayAvatarURL({ dynamic: false }))

    //reply with embed
    return interaction.editReply({
        embeds: [messageEmbed],
        ephemeral: false,
    }).catch((err) => { });

}


//command information
module.exports.command = {
    name: 'info',
    description: 'Show client information',
    usage: '/info',
    private: true,
    cooldown: 0
}
module.exports.interaction = {
    type: 1, // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandType
    permissionType: [], // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandPermissionType  
    optionType: [], // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType 
    ephemeral: false,
    modal: false,
    defaultMemberPermissions: ['Administrator']
}