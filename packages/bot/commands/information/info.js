const { EmbedBuilder, version: discordVersion } = require('discord.js');
const { version: botVersion } = require('../../package.json');
const { formatTime } = require('../../lib/helpers/TimeDateHelpers/TimeDateHelpers');

module.exports.props = {
    commandName: "info",
    description: "Check the client information",
    usage: "/info",
    interaction: {}
}

module.exports.run = async (client, interaction) => {

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
    return interaction.reply({
        embeds: [messageEmbed],
        ephemeral: false,
    }).catch((err) => { throw err });
}