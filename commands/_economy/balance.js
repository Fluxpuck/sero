/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit fluxpuck.com  */

// → Assets and configs
// → Modules, functions and utilities
const { getMemberCreditsBalance } = require("../../database/QueryManager")

//construct the command and export
module.exports.run = async (client, interaction) => {

    //set 60 second cooldown feature for this command
    // → ...

    //get balance from database
    const memberBalance = await getMemberCreditsBalance(interaction.guild.id, interaction.user.id);
    if (memberBalance === false) return interaction.editReply({
        content: `*Oops, looks like you haven't registered yet. Please use \`/register-work\` to start your journey.*`,
        ephemeral: true
    })

    //return message to user
    return interaction.editReply({
        content: `Your current balance is: 🪙 **${new Intl.NumberFormat().format(memberBalance)}** ${memberBalance == 1 ? 'credit' : 'credits'}.`,
        ephemeral: false
    })

}


//command information
module.exports.info = {
    command: {
        name: 'balance',
        category: 'ECONOMY',
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