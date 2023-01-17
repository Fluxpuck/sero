/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit fluxpuck.com  */

// → Assets and configs
// → Modules, functions and utilities

//construct the command and export
module.exports.run = async (client, interaction) => {









}


//command information
module.exports.info = {
    command: {
        name: 'remove-credits',
        category: 'economy',
        desc: 'Remove credits from a member',
        usage: '/remove-credits [member]'
    },
    slash: {
        type: 1, //ChatInput 1, User 2, Message 3
        options: [ //type → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType
            {
                name: 'member',
                type: 6,
                description: 'Choose a member',
                required: true
            }
        ],
        modal: false,
        permission: [],
        defaultMemberPermissions: ['ManageGuild'],
        ephemeral: false
    }
}