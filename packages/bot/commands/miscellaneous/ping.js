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
    interaction.editReply(`Pong! → ${message.createdTimestamp - interaction.createdTimestamp}ms`);



    const payload = {
        guildId: interaction.guild.id,
        channelId: interaction.channel.id,
    };

    client.emit("guildMemberBirthday", payload);

}