/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit fluxpuck.com  */


// → Assets and configs
// → Modules, functions and utilities
const { saveMemberToBL } = require("../../database/QueryManager");

//construct the command and export
module.exports.run = async (client, interaction) => {

    //check for selected member
    const blockMember = interaction.options.get('member');
    const expireValue = interaction.options.get('time');
    const expireTime = expireValue ? expireValue.value : null

    //save to database
    await saveMemberToBL(interaction.guild, blockMember.user, expireTime)

    //return message to user
    return interaction.editReply({
        content: `**${blockMember.user.username}** has been blocked from applying again.`,
        ephemeral: true
    })

}


//command information
module.exports.info = {
    command: {
        name: 'block-apply',
        category: 'applications',
        desc: 'Block a member to prevent them applying (again)',
        usage: '/set-application'
    },
    slash: {
        type: 1, //ChatInput 1, User 2, Message 3
        options: [ //type → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType
            {
                name: 'member',
                type: 6,
                description: 'Choose a member to block from applying',
                required: true
            },
            {
                name: 'time',
                type: 10,
                minValue: 1,
                maxValue: 365,
                description: 'How long should the member be blocked for in days?',
                required: false
            },
        ],
        modal: false,
        permission: [],
        defaultMemberPermissions: ['ManageGuild'],
        ephemeral: true
    }
}