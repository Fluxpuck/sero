const { postRequest } = require("../../database/connection");

module.exports.props = {
    commandName: "remove-exp",
    description: "Remove experience from a user",
    usage: "/remove-exp [user] [amount]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                type: 6,
                description: "Select a user to remove experience from",
                required: true
            },
            {
                name: "amount",
                type: 10,
                description: "The amount of experience to remove from the user",
                required: true,
                minValue: 1,
                maxValue: 1000000,
            },
        ],
    }
}

module.exports.run = async (client, interaction) => {
    // Get User && Amount details from the interaction options
    const targetUser = interaction.options.get("user").user;
    const targetAmount = interaction.options.get("amount").value;

    // Give the user the experience
    const result = await postRequest(`/levels/add/${interaction.guildId}/${targetUser.id}`, { experience: -targetAmount });

    // If the request was not successful, return an error
    if (result.status !== 200) {
        return interaction.reply({
            content: "Something went wrong while giving experience to the user",
            ephemeral: true
        })
    } else {
        return interaction.reply({
            content: `${targetAmount} experience was removed from <@${targetUser.id}>!`,
            ephemeral: false
        })
    }
}