/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit hyperbot.cc  */

//load required modules
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

//construct the command and export
module.exports.run = async (client, interaction) => {




}

//command information
module.exports.info = {
    command: {
        name: 'commandlist',
        category: 'Custom Commands',
        desc: 'Shows a list with all the custom commands',
        usage: '/commandlist'
    },
    slash: {
        type: 1, //ChatInput 1, User 2, Message 3
        options: [], //type: Subcommand 1, SubcommandGroup 2, String 3, Integer 4, Boolean 5, User 6, Channel 7, Role 8, Mentionable 9, Number 10, Attachment 11
        modal: false,
        permission: [],
        defaultMemberPermissions: ['KickMembers'],
        ephemeral: true
    }
}