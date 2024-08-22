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
    await interaction.deferReply({ ephemeral: false });

    // Get User && Amount details from the interaction options
    const targetUser = interaction.options.get("user").user;
    const targetAmount = interaction.options.get("amount").value || 0;

    // Get the user's balance && check if the user has money.
    const currentUser = await getRequest(`/guilds/${interaction.guildId}/economy/balance/${targetUser.id}`);
    // If the request was not successful, return an error
    if (result?.status !== 200) {
        await interaction.deleteReply();
        return interaction.followUp({
            content: `Uh oh! The user ${targetUser.username} has no balance yet.`,
            ephemeral: true
        })
    } else {
        // Check if the user has any balance, else set null
        const currentBalance = currentUser ? currentUser.balance : 0;

        // Check if the user has the proper amount of money.
        if (currentBalance < targetAmount) {
            // Remove the current balance, setting it to null
            await postRequest(`/guilds/${interaction.guildId}/economy/balance`, { userId: targetUser.id, amount: -currentBalance })

        } else {
            // Remove the user's balance if has proper amount.
            await postRequest(`/guilds/${interaction.guildId}/economy/balance`, { userId: targetUser.id, amount: -targetAmount });
            return interaction.editReply({
                content: `**${targetAmount.toLocaleString()}** coins were removed from <@${targetUser.id}>!`,
                ephemeral: false
            })
        }
    }
}
