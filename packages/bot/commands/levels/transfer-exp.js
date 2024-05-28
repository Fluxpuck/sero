const { postRequest } = require("../../database/connection");

module.exports.props = {
    commandName: "transfer-exp",
    description: "Transfer experience to another user",
    usage: "/transfer-exp [user] [amount]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                type: 6,
                description: "Select a user to transfer experience to",
                required: true
            },
            {
                name: "amount",
                type: 10,
                description: "The amount of experience to transfer to the user",
                required: true,
                minValue: 1,
                maxValue: 1000,
            },
        ],
    },
    defaultMemberPermissions: ['SendMessages'],
}

module.exports.run = async (client, interaction) => {
    await interaction.deferReply({ ephemeral: false });

    // Get User && Amount details from the interaction options
    const targetUser = interaction.options.get("user").user;
    const transferAmount = interaction.options.get("amount").value;

    /**
     * This code whas a 24 hour cooldown per user
     */
    const cooldownKey = targetUser.id + interaction.id
    if (client.cooldowns.has(cooldownKey) === false) {

        // Remove exp from the author
        const removeResult = await postRequest(`/levels/add/${interaction.guildId}/${interaction.user.id}`, { experience: -transferAmount });
        // Add exp to the target
        const addResult = await postRequest(`/levels/add/${interaction.guildId}/${targetUser.id}`, { experience: transferAmount });

        // If either request was not successful, return an error
        if (removeResult.status !== 200 || addResult.status !== 200) {
            await interaction.deleteReply();
            interaction.followUp({
                content: "Something went wrong while transferring experience to the user.",
                ephemeral: true
            })
        } else {
            interaction.editReply({
                content: `<@${targetUser.id}> has recieved **${transferAmount}** of your experience!`,
                ephemeral: false
            })
        }

        // Add the user to the cooldowns Collection
        return client.cooldowns.set(cooldownKey, interaction, 12 * 60 * 60) // 3600 minutes 
    } else {
        await interaction.deleteReply();
        return interaction.followUp({
            content: `You can only transfer experience once per 12-hours!`,
            ephemeral: true
        })
    }
}