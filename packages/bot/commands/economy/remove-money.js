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

    // Remove the user's balance by the target amount
    const result = await postRequest(`/guilds/${interaction.guildId}/economy/balance/${targetUser.id}`, { amount: -targetAmount });

    // If the request was not successful, return an error
    if (result && result?.status !== 200) {
        await interaction.deleteReply();
        interaction.followUp({
            content: `Uh oh! Something went wrong while removing money from <@${targetUser.id}>.`,
            ephemeral: true
        })

    } else {
        return interaction.editReply({
            content: `**${targetAmount}** money was removed from <@${targetUser.id}>!`,
            ephemeral: false
        })
    }
}
