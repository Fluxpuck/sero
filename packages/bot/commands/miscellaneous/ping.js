module.exports.props = {
    commandName: "ping",
    description: "Check the client latency",
    usage: "/ping",
    interaction: {},
    defaultMemberPermissions: ['SendMessages'],
}

module.exports.run = async (client, interaction) => {

    // Reply with Discord Latency
    const message = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    return interaction.editReply(`Pong! → ${message.createdTimestamp - interaction.createdTimestamp}ms`);
}