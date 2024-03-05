const { postRequest, getRequest } = require("../../database/connection");

module.exports.props = {
    commandName: "remove-money",
    description: "Remove money from a user.",
    usage: "/remove-money [user] [amount]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                type: 6,
                description: "Select a user to remove money from",
                required: true
            },
            {
                name: "amount",
                type: 10,
                description: "The amount of money to remove from the user",
                required: true,
                minValue: 1,
                maxValue: 1000000,
            },
        ],
    },
    defaultMemberPermissions: ['ManageGuild'],
}

module.exports.run = async (client, interaction) => {
    // Get User && Amount details from the interaction options
    const targetUser = interaction.options.get("user").user;
    const targetAmount = interaction.options.get("amount").value || 0;


    // Get the user's balance && check if the user has money.
    const currentUser = await getRequest(`/balance/${interaction.guildId}/${targetUser.id}`);
    const currentBalance = currentUser ? currentUser.balance : 0;

    // Check if the user has the proper amount of money.
    if (currentBalance < targetAmount) {
        const result = await postRequest(`/balance/${interaction.guildId}/${targetUser.id}`, { amount: -currentBalance })
        console.log(result.data)
    } else {
        // Remove the user's balance if has proper amount.
        const result = await postRequest(`/balance/${interaction.guildId}/${targetUser.id}`, { amount: -targetAmount });
        console.log(result.data)
        return interaction.reply({
            content: `**${targetAmount.toString()}** coins were removed from <@${targetUser.id}>!`,
            ephemeral: false
        })
    }
}

