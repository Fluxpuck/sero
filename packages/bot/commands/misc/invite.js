const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const INVITE_BUTTON = new ButtonBuilder()
    .setStyle(ButtonStyle.Link)
    .setURL('https://google.com/')
    .setEmoji('🔗')
    .setLabel('Invite')
    .setDisabled(false)

module.exports.props = {
    commandName: "invite",
    description: "Invite the bot to your server",
    usage: "/invite",
    interaction: {}
}

module.exports.run = async (client, interaction) => {

    // Reply with client invite
    return interaction.editReply({
        content: `Hello friend. I can help you out! Click the button below to invite me to your server`,
        components: [new ActionRowBuilder().addComponents(INVITE_BUTTON)]
    })

}