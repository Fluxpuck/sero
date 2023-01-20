/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit fluxpuck.com  */


// → Assets and configs
// → Modules, functions and utilities
const { getMemberCreditsBalance } = require("../../database/QueryManager");

//construct the command and export
module.exports.run = async (client, interaction) => {

    //check for selected member
    const checkMember = interaction.options.get('member');

    //get balance from database
    const memberBalance = await getMemberCreditsBalance(interaction.guild.id, checkMember.value);
    if (memberBalance === false) return interaction.editReply({
        content: `*Oops, looks like ${checkMember.user.tag} hasn't registered yet.*`,
        ephemeral: true
    })

    //return message to user
    return interaction.editReply({
        content: `**${checkMember.user.tag}**'s current balance is: \`${memberBalance}\` ${memberBalance == 1 ? 'credit' : 'credits'}.`,
        ephemeral: false
    })

}


//command information
module.exports.info = {
    command: {
        name: 'check-balance',
        category: 'ECONOMY',
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