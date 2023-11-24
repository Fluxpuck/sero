const { EmbedBuilder } = require('discord.js');
const EmbedColors = require('../../assets/embed-colors');

module.exports.props = {
    commandName: "help",
    description: "Get information on the bot",
    usage: "/help",
    interaction: {}
}

module.exports.run = async (client, interaction) => {

    



    let messageEmbed = new EmbedBuilder()
        .setTitle(`${client.user.username} | Help`)
        .setThumbnail(client.user.displayAvatarURL({ dynamic: false }))
        .setDescription("Use the dropdown menu to get information on specific commands.")
        .setColor(EmbedColors.BASE_COLOR);




    return interaction.reply({
        embeds: [messageEmbed],
        components: [],
        ephemeral: false
    }).catch((error) => { return error; });

}