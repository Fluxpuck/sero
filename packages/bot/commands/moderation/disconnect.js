module.exports.props = {
    commandName: "disconnect",
    description: "Disconnect a user from a voicechannel",
    usage: "/disconnect [user]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                description: "User to disconnect",
                type: 6,
                required: true
            }
        ]
    },
    defaultMemberPermissions: ['MuteMembers'],
};

module.exports.run = async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true });

    // Get User details from the interaction options
    const targetUser = interaction.options.get("user").user;
    const member = await interaction.guild.members.fetch(targetUser.id)

    // If the user is in a voicechannel, disconnect them
    if (member?.voice.channel) {

        // Disconnect the member from the voicechannel
        await member.voice.disconnect();

        // Send the success message
        return interaction.editReply({
            content: `You successfully disconnected <@${member.user.id}>`,
            ephemeral: true,
        });
    } else {
        return interaction.editReply({
            content: `<@${member.user.id}> is not in a voice channel.`,
            ephemeral: true
        });
    }
};
