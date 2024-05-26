const { EmbedBuilder, version: discordVersion } = require('discord.js');
const { version: botVersion } = require('../../package.json');
const { formatTime } = require('../../lib/helpers/TimeDateHelpers/timeHelper');
const { getRequest, postRequest } = require('../../database/connection');

module.exports.props = {
    commandName: "info",
    description: "Check the client information",
    usage: "/info",
    interaction: {},
    defaultMemberPermissions: ['ManageMessages'],
}

module.exports.run = async (client, interaction) => {
    await interaction.deferReply({ ephemeral: false });

    // Setting up the embedded message
    const messageEmbed = new EmbedBuilder()
        .setTitle(client.user.username)
        .setThumbnail(client.user.displayAvatarURL({ dynamic: false }))
        .setDescription(`${client.user.username} is a Discord bot written in JavaScript using the Discord.js library.`)
        .addFields(
            { name: 'Version', value: botVersion, inline: true },
            { name: 'Discord.js', value: discordVersion, inline: true },
            { name: 'Uptime', value: formatTime(client.uptime), inline: true }
        )

    // Sending the message
    return interaction.editReply({
        embeds: [messageEmbed],
        ephemeral: false,
    }).catch((err) => { throw err });
}