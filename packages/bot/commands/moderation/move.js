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
                type: 7, // CHANNEL
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
/**
 * 
 * @param {CommandInteraction} interaction 
 */
module.exports.run = async (client, interaction) => {
    const firstChannel = interaction.options.get("voice-channel").value;
    const targetChannel = interaction.options.get("target-channel").value;

    const from = interaction.guild.channels.cache.get(firstChannel);
    const to = interaction.guild.channels.cache.get(targetChannel);

    if (!from || !to || from.type !== 2 || to.type !== 2) {
        return interaction.reply({
            content: `Invalid voice channels provided.`,
            ephemeral: true
        })
    }
    const voiceStates = from.members;
    if (voiceStates.size === 0) {
        return interaction.reply({
            content: "There are no members in the source channel."
        })
    }

    voiceStates.forEach((voiceState) => {
        if (voiceState.voice) {
            voiceState.voice.setChannel(to);
        }
    })
    interaction.reply({
        content: `Moved all users to the <#${to.id}>.`,
        ephemeral: true
    })

}
