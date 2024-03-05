const { postRequest, getRequest } = require("../../database/connection");

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
    },
    defaultMemberPermissions: ['ManageGuild'],
}

module.exports.run = async (client, interaction) => {
    // Get User && Amount details from the interaction options
    const targetUser = interaction.options.get("user").user;
    const targetAmount = interaction.options.get("amount").value || 0;


    // Get the user's the experience && check if the user has experience.
    const currentUser = await getRequest(`/levels/${interaction.guildId}/${targetUser.id}`);
    const currentExperience = currentUser ? currentUser.experience : 0;

    // Check if the user has the proper amount of experience.
    if (currentExperience < targetAmount) {
        await postRequest(`/levels/add/${interaction.guildId}/${targetUser.id}`, { experience: -currentExperience })
    }
    // Remove the user's experience if has proper amount.
    const result = await postRequest(`/levels/add/${interaction.guildId}/${targetUser.id}`, { experience: -targetAmount });
    if (result && result.status !== 200) {
        interaction.reply({
            content: "Something went wrong while removing experience from the user.",
            ephemeral: true
        })

    } else {
        return interaction.reply({
            content: `**${targetAmount}** experience was removed from <@${targetUser.id}>!`,
            ephemeral: false
        })
    }
}
