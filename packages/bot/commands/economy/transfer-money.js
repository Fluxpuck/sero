const { postRequest } = require("../../database/connection");

module.exports.props = {
    commandName: "transfer-money",
    description: "Transfer money to another user",
    usage: "/transfer-money [user] [amount]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                type: 6,
                description: "Select a user to transfer money to",
                required: true
            },
            {
                name: "amount",
                type: 10,
                description: "The amount of coins to transfer to the user",
                required: true,
                minValue: 1,
                maxValue: 10_000,
            },
        ],
    },
    defaultMemberPermissions: ['SendMessages'],
    cooldown: 2 * 60, // 2 minute cooldown
}

module.exports.run = async (client, interaction) => {
    await interaction.deferReply({ ephemeral: false });

    // Get User && Amount details from the interaction options
    const targetUser = interaction.options.get("user").user;
    const transferAmount = interaction.options.get("amount").value;

    // Remove balance from the author
    const removeResult = await postRequest(`/guilds/${interaction.guildId}/economy/balance`, { userId: targetUser.id, amount: -transferAmount })
    // Add balance to the target
    const addResult = await postRequest(`/guilds/${interaction.guildId}/economy/balance`, { userId: targetUser.id, amount: +transferAmount });

    // If either request was not successful, return an error
    if (removeResult.status !== 200 || addResult.status !== 200) {
        await interaction.deleteReply();
        interaction.followUp({
            content: "Something went wrong while transferring money to the user.",
            ephemeral: true
        })
    } else {
        interaction.editReply({
            content: `<@${targetUser.id}> has recieved **${transferAmount.toLocaleString()}** of your money!`,
            ephemeral: false
        })
    }
} 