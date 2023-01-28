/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit fluxpuck.com  */


// → Assets and configs
// → Modules, functions and utilities
const { giveMemberCredits, createEconomyLog, getMemberCreditsBalance } = require("../../database/QueryManager");

//construct the command and export
module.exports.run = async (client, interaction) => {

    //check for selected member
    const giveMember = interaction.options.get('member');
    const giveAmount = interaction.options.get('amount');

    //get balance from database
    const memberBalance = await getMemberCreditsBalance(interaction.guild.id, giveMember.value);
    if (memberBalance === false) return interaction.editReply({
        content: `*Oops, looks like ${giveMember.user.tag} hasn't registered yet.*`,
        ephemeral: true
    })

    //add funds to members credits
    await giveMemberCredits(interaction.guild.id, giveMember.value, giveAmount.value);

    //save log to database
    await createEconomyLog(interaction.guild.id, module.exports.info.command.name, giveMember.user, { old: memberBalance, new: (memberBalance + giveAmount.value) });

    //reply message to the user
    return interaction.editReply({
        content: `${giveMember.user.tag} just recieved *${new Intl.NumberFormat().format(giveAmount.value)}*. Their current balance is now: 🪙 **${new Intl.NumberFormat().format(memberBalance + giveAmount.value)}** credits`,
        ephemeral: false
    })

}


//command information
module.exports.info = {
    command: {
        name: 'give-credits',
        category: 'ECONOMY',
        desc: 'Give credits to a member',
        usage: '/give-credits [member] [amount]'
    },
    slash: {
        type: 1, //ChatInput 1, User 2, Message 3
        options: [ //type → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType
            {
                name: 'member',
                type: 6,
                description: 'Choose a member',
                required: true
            },
            {
                name: 'amount',
                type: 10,
                description: 'Choose the amount of credits',
                required: true
            }
        ],
        modal: false,
        permission: [],
        defaultMemberPermissions: ['ManageGuild'],
        ephemeral: false
    }
}