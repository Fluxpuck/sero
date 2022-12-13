/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit fluxpuck.com  */

// → Assets and configs
const { BOT_BUTTON } = require('../../assets/buttons');
// → Modules, functions and utilities
const { ActionRowBuilder } = require('discord.js');

//construct the command and export
module.exports.run = async (client, interaction) => {

    //construct invite button
    const web_button = new ActionRowBuilder()
        .addComponents(BOT_BUTTON);

    //reply with Discord Latency
    return interaction.editReply({
        content: `Hey, this is **${client.user.username}**, here to help *create* and *use* __custom commands__.\nClick the button below to invite me to your server`,
        components: [web_button]
    })

}


//command information
module.exports.info = {
    command: {
        name: 'invite',
        category: 'misc',
        desc: 'Invite the bot to your own server',
        usage: '/invite'
    },
    slash: {
        type: 1, //ChatInput 1, User 2, Message 3
        options: [], //type: Subcommand 1, SubcommandGroup 2, String 3, Integer 4, Boolean 5, User 6, Channel 7, Role 8, Mentionable 9, Number 10, Attachment 11
        modal: false,
        permission: [],
        defaultMemberPermissions: ['SendMessages'],
        ephemeral: true
    }
}