const { ButtonBuilder, ButtonStyle } = require('discord.js');

// ButtonStyle → https://discord-api-types.dev/api/discord-api-types-v10/enum/ButtonStyle
// Button Object → https://discord.com/developers/docs/interactions/message-components#button-object-button-styles

const ClientButtonsEnum = {

    NEXT_PAGE: new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel('Next >')
        .setCustomId('next_pg')
        .setDisabled(false),

    PREVIOUS_PAGE: new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel('< Previous')
        .setCustomId('previous_pg')
        .setDisabled(false),

    AGREE: new ButtonBuilder()
        .setStyle(ButtonStyle.Success)
        .setLabel('Agree')
        .setCustomId('agree')
        .setDisabled(false),

    CANCEL: new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setLabel('Cancel')
        .setCustomId('cancel')
        .setDisabled(false),

    INVITE: new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel('Invite Me')
        .setURL('https://discord.com/')
        .setDisabled(false),

    INFO: new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('ℹ️')
        .setCustomId('info')
        .setDisabled(false),

    LOGS: new ButtonBuilder()
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🔍')
        .setLabel('All Logs')
        .setCustomId('logs')
        .setDisabled(false),

    AVATAR: new ButtonBuilder()
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🖼️')
        .setLabel('Avatar')
        .setCustomId('avatar')
        .setDisabled(false),
};

module.exports = ClientButtonsEnum;