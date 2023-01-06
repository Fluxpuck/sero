/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit fluxpuck.com  */


// → Assets and configs
// → Modules, functions and utilities
const { deleteMemberFromBL } = require("../../database/QueryManager");

//construct the command and export
module.exports.run = async (client, interaction) => {

    //check for selected member
    const blockMember = interaction.options.get('member');

    //remove member from block list
    await deleteMemberFromBL(interaction.guild.id, blockMember.value);

    //return message to user
    return interaction.editReply({
        content: `**${blockMember.user.username}** has been unblocked and can apply again.`,
        ephemeral: true
    })
}


//command information
module.exports.info = {
    command: {
        name: 'remove-block-apply',
        category: 'applications',
        desc: 'Remove a blocked member and allow them to apply again',
        usage: '/remove-block-apply'
    },
    slash: {
        type: 1, //ChatInput 1, User 2, Message 3
        options: [ //type: Subcommand 1, SubcommandGroup 2, String 3, Integer 4, Boolean 5, User 6, Channel 7, Role 8, Mentionable 9, Number 10, Attachment 11
            {
                name: 'member',
                type: 6,
                description: 'Choose a member remove their application block',
                required: true
            },
        ],
        modal: false,
        permission: [],
        defaultMemberPermissions: ['ManageGuild'],
        ephemeral: true
    }
}