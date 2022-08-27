/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit hyperbot.cc  */

//construct the command and export
module.exports.run = async (client, interaction) => {




}

//command information
module.exports.info = {
    command: {
        name: 'removecommand',
        category: 'Custom Commands',
        desc: 'Remove a custom command',
        usage: '/removecommand [commandname]'
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