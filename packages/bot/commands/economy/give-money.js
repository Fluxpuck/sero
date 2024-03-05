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
    const targetAmount = interaction.options.get("amount").value;

    // Give the user the money
    const result = await postRequest(`/balance/${interaction.guildId}/${targetUser.id}`, { amount: targetAmount });

    // If the request was not successful, return an error
    if (result.status !== 200) {
        return interaction.reply({
            content: `Uh oh! The user ${targetUser.username} has no balance yet.`,
            ephemeral: true
        })
    } else {
        return interaction.reply({
            content: `<@${targetUser.id}> has recieved **${targetAmount}** coins!`,
            ephemeral: false
        })
    }
}