/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit hyperbot.cc  */


// Constructing the command and exporting
module.exports.run = async (client, interaction) => {

}


//command information
module.exports.command = {
    name: 'info',
    description: 'Show client information',
    usage: '/info',
    private: true,
    cooldown: 0
}
module.exports.interaction = {
    type: 1, // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandType
    permissionType: [], // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandPermissionType  
    optionType: [], // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType 
    ephemeral: false,
    modal: false,
    defaultMemberPermissions: ['Administrator']
}