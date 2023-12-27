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

    // Check if the mentioned user is not the author and then return.
    if(targetMember.user.id === interaction.user.id) return interaction.reply({
        content: `You cannot disconnect yourself.`,
        ephemeral: true
    })
    
    if (targetMember?.voice.channel) {
        // Set a disconnected flag on the member object
        targetMember.voice.disconnected = true;

        // Disconnect the member from the voicechannel
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
