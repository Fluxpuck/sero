const { getRequest } = require("../../database/connection");
const { createCustomEmbed } = require("../../assets/embed")
module.exports.props = {
    commandName: "balance",
    description: "Get the balance of a user.",
    usage: "/reset [user]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                type: 6,
                description: "Select a user to get th balance of",
                required: false
            }
        ],
    },
    defaultMemberPermissions: ['SendMessages'],
}

module.exports.run = async (client, interaction) => {
    await interaction.deferReply({ ephemeral: false });

    // Get User details from the interaction options
    const targetUser = interaction.options.get("user")?.user || interaction.user;

    // Get the user's the experience && check if the user has experience.
    const result = await getRequest(`/balance/${interaction.guildId}/${targetUser.id}`);
    const balance = result?.data.balance || 0;

    // Create an embed to display the user's balance
    const messageEmbed = createCustomEmbed({
        title: `${targetUser.username}'s balance`,
        description: `:coin: ${balance.toLocaleString()} coin${balance > 1 ? "s" : ""}`
    })

    // Reply with the messageEmbed
    return interaction.editReply({
        embeds: [messageEmbed],
        ephemeral: false
    })

}
