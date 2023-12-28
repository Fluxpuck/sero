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
    defaultMemberPermissions: ['KickMembers'],
};

module.exports.run = async (client, interaction) => {
    // Get User details from the interaction options
    const targetUser = interaction.options.get("user").user;

    // If the user is in a voicechannel, disconnect them
    if (targetUser?.voice.channel) {

        // Disconnect the member from the voicechannel
        await targetUser.voice.disconnect();

        // Send the success message
        return interaction.reply({
            content: `Successfully disconnected <@${targetUser.id}>`,
            ephemeral: false,
        });
    } else {
        return interaction.reply({
            content: `<@${targetUser.id}> is not in a voicechannel`,
            ephemeral: true
        });
    }
};
