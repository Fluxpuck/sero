/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit hyperbot.cc  */

//import styling from assets
const embed = require('../../assets/embed.json');
const { WEB_button } = require('../../assets/buttons');

//load required modules
const { EmbedBuilder, ActionRowBuilder } = require('discord.js');
const { msToTime } = require('../../utils/functions');

//require info
const { dependencies } = require('../../package.json');

//construct the command and export
module.exports.run = async (client, interaction) => {

    //setup the embedded message
    const messageEmbed = new EmbedBuilder()
        .setTitle('Flux - Information')
        .setDescription(`Use command \`/help\` for more information.`)
        .addFields(
            { name: `Guilds`, value: `\`\`\`${client.guilds.cache.size}\`\`\``, inline: true },
            { name: `Commands`, value: `\`\`\`${client.commands.size} commands\`\`\``, inline: true },
            { name: `Events`, value: `\`\`\`${client.events.size} events\`\`\``, inline: true },
            { name: `Client version`, value: `\`\`\`${client.version}\`\`\``, inline: true },
            { name: `DiscordJS version`, value: `\`\`\`${Object.values(dependencies)[0]}\`\`\``, inline: true },
            { name: `Uptime`, value: `\`\`\`${msToTime(process.uptime())}\`\`\``, inline: false },
        )
        .setThumbnail(client.user.displayAvatarURL({ dynamic: false }))
        .setColor(embed.color)

    //construct website button
    const web_button = new ActionRowBuilder()
        .addComponents(WEB_button);

    //reply with embed
    return interaction.editReply({
        embeds: [messageEmbed],
        components: [web_button],
        ephemeral: false
    }).catch((err) => { });

}


//command information
module.exports.info = {
    command: {
        name: 'info',
        category: 'misc',
        desc: 'Show client information',
        usage: '/info'
    },
    slash: {
        type: 1, //ChatInput 1, User 2, Message 3
        options: [], //Subcommand 1, SubcommandGroup 2, String 3, Integer 4, Boolean 5, User 6, Channel 7, Role 8, Mentionable 9, Number 10, Attachment 11
        modal: false,
        permission: [],
        defaultMemberPermissions: ['KickMembers'],
        ephemeral: false
    }
}