module.exports.props = {
    commandName: "ping",
    description: "Check the client latency",
    usage: "/ping",
    interaction: {},
    defaultMemberPermissions: ['SendMessages'],
}

module.exports.run = async (client, interaction) => {
    await interaction.deferReply({ ephemeral: false })

    // Reply with Discord Latency
    const message = await interaction.editReply({ content: 'Pinging...', fetchReply: true });
    interaction.editReply(`Pong! → ${message.createdTimestamp - interaction.createdTimestamp}ms`);

}