module.exports.props = {
    commandName: "disconnect",
    description: "Disconnect a user from their voicechannel",
    usage: "/disconnect [user]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                description: "Select a user to disconnect from a voicechannel",
                type: 6,
                required: true
            }
        ]
    }
};

module.exports.run = async (client, interaction) => {
    const targetUser = interaction.options.get("user");
    const targetMember = await interaction.guild.members.fetch(targetUser.value);

    if (targetMember?.voice.channel) {
        await targetMember.voice.disconnect();
        return interaction.reply({
            content: `Successfully disconnected <@${targetMember.id}>`,
            ephemeral: false,
        });
    } else {
        return interaction.reply({
            content: `<@${targetMember.id}> is not in a voicechannel`,
            ephemeral: true
        });
    }
};
