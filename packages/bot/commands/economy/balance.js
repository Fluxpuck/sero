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
    defaultMemberPermissions: ['KickMembers'],
}

module.exports.run = async (client, interaction) => {
    // Get User details from the interaction options
    const targetUser = interaction.options.get("user")?.user || interaction.user;

    // Get the user's the experience && check if the user has experience.
    const result = await getRequest(`/balance/${interaction.guildId}/${targetUser.id}`);
    const { balance } = result.data;

    // Setup Embed:
    const embed = createCustomEmbed({
        title: `${targetUser.username}'s balance`,
        fields: [
            {
                name: `${targetUser.username}'s balance`,
                value: `:coin: ${balance.toString()} coin${balance > 1 ? "s" : ""}`,
            }
        ],
    })

    return interaction.reply({
        embeds: [embed]
    })
}
