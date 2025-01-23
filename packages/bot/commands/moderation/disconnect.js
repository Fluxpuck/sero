const { MessageFlags } = require('discord.js');
const { postRequest } = require("../../database/connection");
const { deferInteraction, replyInteraction } = require("../../utils/InteractionManager");

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
    await deferInteraction(interaction, true);

    // Get User details from the interaction options
    const targetUser = interaction.options.get("user").user;
    const member = await interaction.guild.members.fetch(targetUser.id);

    // If the user is in a voicechannel, disconnect them
    if (member?.voice.channel) {

        // Store the activity in the database
        postRequest(`/guilds/${interaction.guild.id}/activities`, {
            guildId: interaction.guild.id,
            userId: targetUser.id,
            type: "voice-disconnect",
            additional: {
                channelId: member.voice.channel.id,
                executedBy: interaction.user.id
            }
        });

        // Disconnect the member from the voicechannel
        await member.voice.disconnect();

        // Send the success message
        return replyInteraction(interaction, {
            content: `You successfully disconnected <@${member.user.id}>`,
            flags: MessageFlags.Ephemeral,
        });
    } else {
        return replyInteraction(interaction, {
            content: `<@${member.user.id}> is not in a voice channel.`,
            flags: MessageFlags.Ephemeral
        });
    }
};
