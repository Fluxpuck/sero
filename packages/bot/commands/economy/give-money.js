const { postRequest, getRequest } = require("../../database/connection");

module.exports.props = {
    commandName: "give-money",
    description: "Give money to a user.",
    usage: "/give-money [user] [amount]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                type: 6,
                description: "Select a user to give money to.",
                required: true
            },
            {
                name: "amount",
                type: 10,
                description: "The amount of money to give to the user",
                required: true,
                minValue: 1,
                maxValue: 1000000,
            },
        ],
    },
    defaultMemberPermissions: ['KickMembers'],
}

module.exports.run = async (client, interaction) => {
    // Get User && Amount details from the interaction options
    const targetUser = interaction.options.get("user").user;
    const targetAmount = interaction.options.get("amount").value || 0;


    // Get the user's balance && check if the user has money.
    const currentUser = await getRequest(`/balance/${interaction.guildId}/${targetUser.id}`);
    const currentBalance = currentUser ? currentUser.balance : 0;

    // Check if the user has the proper amount of money.
    if(currentBalance < targetAmount) {
        return interaction.reply({
            content: `You do not have enough money for this transaction!`,
            ephemeral: true
        })
    } else {
        // Give money to the user && remove money from the exeuctor if the executor has proper amount.
        await postRequest(`/balance/${interaction.guildId}/${targetUser.id}`, { amount: +targetAmount });
        await postRequest(`/balance/${interaction.guildId}/${interaction.user.id}`, { amount: -targetAmount })
        return interaction.reply({
            content: `**${targetAmount.toString()}** coins were given to <@${targetUser.id}>!`,
            ephemeral: false
        })
    }
}