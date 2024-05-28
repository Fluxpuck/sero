module.exports.props = {
    commandName: "move",
    description: "Move ALL users from a voice channel into another.",
    usage: "/move [voice-channel] [target-channel]",
    interaction: {
        type: 1,
        options: [
            {
                name: "voice-channel",
                description: "Select the voice channel of which you want users to move from.",
                type: 7,
                required: true,
                channelTypes: [2]
            },
            {
                name: "target-channel",
                description: "The voice channel to move all users to.",
                type: 7,
                required: true,
                channelTypes: [2]
            }
        ]
    },
    defaultMemberPermissions: ['MoveMembers'],
};

module.exports.run = async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true });

    // Get the voice channels from the interaction options
    const firstChannel = interaction.options.get("voice-channel").value;
    const targetChannel = interaction.options.get("target-channel").value;

    // Set the location and destination channels
    const from = interaction.guild.channels.cache.get(firstChannel);
    const to = interaction.guild.channels.cache.get(targetChannel);

    // Check if the channels are valid
    if (!from || !to || from.type !== 2 || to.type !== 2) {
        return interaction.editReply({
            content: `Invalid voice channels provided.`,
            ephemeral: true
        })
    }

    // Get the voice states from the source channel
    const voiceStates = from.members;
    if (voiceStates.size === 0) {
        return interaction.editReply({
            content: "There are no members in the source channel.",
            ephemeral: true
        })
    }

    // Move all users to the target channel
    voiceStates.forEach((voiceState) => {
        if (voiceState.voice) {
            voiceState.voice.setChannel(to);
        }
    })

    // Return confirmation message
    interaction.editReply({
        content: `Moved all users to the <#${to.id}>.`,
        ephemeral: true
    })

}
