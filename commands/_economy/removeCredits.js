/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit fluxpuck.com  */

// → Assets and configs
// → Modules, functions and utilities
const { removeMemberCredits, createEconomyLog, getMemberCreditsBalance } = require("../../database/QueryManager");

//construct the command and export
module.exports.run = async (client, interaction) => {

    //check for selected member
    const removeMember = interaction.options.get('member');
    const removeAmount = interaction.options.get('amount');

    //get balance from database
    const memberBalance = await getMemberCreditsBalance(interaction.guild.id, removeMember.value);
    if (memberBalance === false) return interaction.editReply({
        content: `*Oops, looks like ${removeMember.user.tag} hasn't registered yet.*`,
        ephemeral: true
    })

    //add funds to members credits
    await removeMemberCredits(interaction.guild.id, removeMember.value, removeAmount.value);

    //save log to database
    await createEconomyLog(interaction.guild.id, module.exports.info.command.name, removeMember.user, { old: memberBalance, new: (memberBalance + removeAmount.value) });

    //reply message to the user
    return interaction.editReply({
        content: `${new Intl.NumberFormat().format(removeAmount.value)} credits were just taken from ${removeMember.user.tag}. Their current balance is now: ${new Intl.NumberFormat().format(memberBalance + removeMember.value)} credits`,
    })





}


//command information
module.exports.info = {
    command: {
        name: 'remove-credits',
        category: 'ECONOMY',
        desc: 'Remove credits from a member',
        usage: '/remove-credits [member] [amount]'
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