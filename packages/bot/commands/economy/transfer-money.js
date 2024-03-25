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
}

module.exports.run = async (client, interaction) => {
    // Get User && Amount details from the interaction options
    const targetUser = interaction.options.get("user").user;
    const transferAmount = interaction.options.get("amount").value;

    /**
     * This code whas a 24 hour cooldown per user
     */
    const cooldownKey = targetUser.id + interaction.id
    if (client.cooldowns.has(cooldownKey) === false) {

        // Remove balance from the author
        const removeResult = await postRequest(`/balance/${interaction.guildId}/${interaction.user.id}`, { amount: -transferAmount })
        // Add balance to the target
        const addResult = await postRequest(`/balance/${interaction.guildId}/${targetUser.id}`, { amount: +transferAmount });

        // If either request was not successful, return an error
        if (removeResult.status !== 200 || addResult.status !== 200) {
            interaction.reply({
                content: "Something went wrong while transferring money to the user.",
                ephemeral: true
            })
        } else {
            interaction.reply({
                content: `<@${targetUser.id}> has recieved **${transferAmount.toLocaleString()}** of your money!`,
                ephemeral: false
            })
        }

        // Add the user to the cooldowns Collection
        return client.cooldowns.set(cooldownKey, interaction, 12 * 60 * 60) // 3600 minutes 
    } else {
        return interaction.reply({
            content: `You can only transfer experience once per 12-hours!`,
            ephemeral: true
        })
    }
}