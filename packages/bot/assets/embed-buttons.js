// → Importing necessary modules, functions and classes
const { ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {

    invite: new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel('Invite')
        .setURL('https://discord.com/api/oauth2/authorize?client_id=882615019340079370&permissions=8&scope=bot%20applications.commands')
        .setEmoji('📨'),

    next: new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel('Next >')
        .setCustomId('next')
        .setDisabled(false),

    previous: new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setLabel('< Previous')
        .setCustomId('previous')
        .setDisabled(true),

};

// → https://discord-api-types.dev/api/discord-api-types-v10/enum/ButtonStyle