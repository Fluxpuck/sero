const { ActionRowBuilder } = require('discord.js');
const DiscordButtonsEnum = require('../../assets/embed-buttons');

module.exports.props = {
    commandName: "invite",
    description: "Invite the bot to your server",
    usage: "/invite",
    interaction: {}
}

module.exports.run = async (client, interaction) => {
    return interaction.editReply({
        content: `Hello friend. I can help you out! Click the button below to invite me to your server`,
        components: [new ActionRowBuilder().addComponents(DiscordButtonsEnum.INVITE)]
    });
}