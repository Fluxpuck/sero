/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit fluxpuck.com  */

// → Assets and configs
// → Modules, functions and utilities

//construct the command and export
module.exports.run = async (client, interaction) => {

    //check if economy feature is active
    if (!interaction.guild.fluxFeatures.includes(`ECONOMY`)) return interaction.editReply({
        content: `*This feature is not enabled yet!*`,
        ephemeral: true
    })







}


//command information
module.exports.info = {
    command: {
        name: 'check-balance',
        category: 'economy',
        desc: 'Check credit balance of member',
        usage: '/check-balance [member]'
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