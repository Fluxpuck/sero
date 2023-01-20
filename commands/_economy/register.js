/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit fluxpuck.com  */


// → Assets and configs
// → Modules, functions and utilities
const { getMemberCreditsBalance, registerMemberCredits } = require("../../database/QueryManager")

//construct the command and export
module.exports.run = async (client, interaction) => {

    //set 60 second cooldown feature for this command
    // → ...

    //check if member already has registered
    const memberBalance = await getMemberCreditsBalance(interaction.guild.id, interaction.user.id);
    if (memberBalance != false) return interaction.editReply({
        content: `*Oops, looks like you have already registered.*`,
        ephemeral: true
    })

    //register user to the credit table
    await registerMemberCredits(interaction.guild.id, interaction.user);

    //log to economy logs
    // → ...

    //return message to user
    return interaction.editReply({
        content: `Congratulations! You're now eligable to work and earn credits.`,
        ephemeral: false
    })

}


//command information
module.exports.info = {
    command: {
        name: 'register-work',
        category: 'ECONOMY',
        desc: 'Get your work-visum and to work and earn credits',
        usage: '/register-work'
    },
    slash: {
        type: 1, //ChatInput 1, User 2, Message 3
        options: [ //type → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType
        ],
        modal: false,
        permission: [],
        defaultMemberPermissions: ['ManageGuild'],
        ephemeral: false
    }
}