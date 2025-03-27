const { MessageFlags } = require('discord.js');
const { MUTE_PREREASONS } = require("../../assets/reason-messages");
const { formatExpression } = require("../../lib/helpers/StringHelpers/stringHelper");
const { deferInteraction, replyInteraction, followUpInteraction } = require('../../utils/InteractionManager');

module.exports.props = {
    commandName: "timeout",
    description: "Timeout a user in the server",
    usage: "/timeout [user] [time] [reason]",
    private: true,
    interaction: {
        type: 1,
        options:
            [
                {
                    name: "user",
                    type: 6,
                    description: "User to timeout",
                    required: true
                },
                {
                    name: "time",
                    type: 10,
                    description: "Duration (in minutes) of the timeout",
                    required: true,
                    autocomplete: true
                },
                {
                    name: "reason",
                    type: 3,
                    description: "Reason for the timeout",
                    required: true,
                    autocomplete: true,
                    maxLength: 100
                },
            ],
    },
    defaultMemberPermissions: ['ModerateMembers'],
}

module.exports.autocomplete = async (client, interaction) => {
    const focusedReason = interaction.options.getFocused();

    if (interaction.options.getFocused(true).name === "time") {
        var time = [
            { name: "5 minutes", value: "5" },
            { name: "10 minutes", value: "10" },
            { name: "20 minutes", value: "20" },
            { name: "30 minutes", value: "30" },
            { name: "1 hour", value: "60" },
            { name: "2 hours", value: "120" }
        ]
        return interaction.respond(time.filter(time => time.name.toLowerCase().includes(focusedReason)));
    }

    // Get and format the pre-reasons
    const reasons = Object.keys(MUTE_PREREASONS).map(reason =>
        ({ name: formatExpression(reason), value: MUTE_PREREASONS[reason] })
    );

    // Get the focussed reason && return the filtered reason
    const filteredReasons = reasons.filter(reason => reason.name.toLowerCase().includes(focusedReason.toLowerCase()));
    return interaction.respond(filteredReasons);
}

module.exports.run = async (client, interaction) => {
    await deferInteraction(interaction, true);

    const targetUser = interaction.options.get("user").user;
    const targetDuration = interaction.options.get("time").value;
    const violationReason = interaction.options.get("reason").value || "";

    if (!targetUser) {
        return followUpInteraction(interaction, {
            content: "Oops! Could not find the user",
            flags: MessageFlags.Ephemeral,
        });
    }

    try {
        const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);

        if (targetUser.id === interaction.user.id) {
            return followUpInteraction(interaction, {
                content: "Uhm... You cannot timeout yourself",
                flags: MessageFlags.Ephemeral
            });
        }

        if (member && !member.moderatable) {
            return followUpInteraction(interaction, {
                content: `<@${targetUser.id}> is a moderator!`,
                flags: MessageFlags.Ephemeral
            });
        }

        // Convert the duration to milliseconds
        const duration = parseFloat(targetDuration) * 60 * 1000;

        member.timeout(duration, `${violationReason} - ${interaction.user.username}`)

        return replyInteraction(interaction, {
            content: `You successfully muted <@${member.user.id}> for:\n> ${violationReason}`,
            flags: MessageFlags.Ephemeral,
        });

    } catch (error) {
        console.error(`Failed to timeout user ${targetUser.id}:`, error);
        return followUpInteraction(interaction, {
            content: `Oops! Something went wrong while trying to timeout **${targetUser.username}**`,
            flags: MessageFlags.Ephemeral,
        });
    }
}
