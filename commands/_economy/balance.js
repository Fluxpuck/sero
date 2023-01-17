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
        name: 'balance',
        category: 'economy',
        desc: 'Check your credit balance',
        usage: '/balance'
    },
    slash: {
        type: 1, //ChatInput 1, User 2, Message 3
        options: [ //type → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType
        ],
        modal: false,
        permission: [],
        defaultMemberPermissions: ['ManageGuild'],
        ephemeral: true
    }
}