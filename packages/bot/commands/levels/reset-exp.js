const { postRequest } = require("../../database/connection");

module.exports.props = {
    commandName: "reset-exp",
    description: "Reset all experience of a User",
    usage: "/reset-exp [user]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                type: 6,
                description: "Select a user to reset",
                required: true
            }
        ],
    },
    defaultMemberPermissions: ['ManageGuild'],
}

module.exports.run = async (client, interaction) => {
    // Get User details from the interaction options
    const targetUser = interaction.options.get("user").user;

    // Give the user the experience
    const result = await postRequest(`/levels/reset/${interaction.guildId}/${targetUser.id}`);

    // If the request was not successful, return an error
    if (result.status !== 200) {
        return interaction.reply({
            content: "Something went wrong while resetting the users experience.",
            ephemeral: true
        })
    } else {
        return interaction.reply({
            content: `<@${targetUser.id}>'s experience has been reset!`,
            ephemeral: false
        })
    }
}