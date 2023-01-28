/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit fluxpuck.com  */


// → Assets and configs
// → Modules, functions and utilities
const { giveMemberCredits, createEconomyLog, getMemberCreditsBalance, removeMemberCredits } = require("../../database/QueryManager");

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

    //add funds to target members credits & remove from your account
    await giveMemberCredits(interaction.guild.id, giveMember.value, giveAmount.value);
    await removeMemberCredits(interaction.guild.id, interaction.user.id, giveAmount.value);

    //save log to database
    await createEconomyLog(interaction.guild.id, module.exports.info.command.name, giveMember.user, { old: memberBalance, new: (memberBalance + giveAmount.value) });

    //get a random success message
    const { transfer_success } = require('../../assets/messages.json');
    let idx = Math.floor(Math.random() * transfer_success.length);

    //reply message to the user
    return interaction.editReply({
        content: `${transfer_success[idx].replace('{amount}', `${new Intl.NumberFormat().format(giveAmount.value)}`).replace('{user}', `${giveMember.user.tag}`)}`,
        ephemeral: false
    })

}


//command information
module.exports.info = {
    command: {
        name: 'transfer-credits',
        category: 'ECONOMY',
        desc: 'Transfer credits from you to another member',
        usage: '/transfer-credits [member] [amount]'
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