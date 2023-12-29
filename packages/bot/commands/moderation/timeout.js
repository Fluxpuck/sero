const { MUTE_PREREASONS } = require("../../assets/reason-messages");
const { PermissionFlagsBits } = require("discord.js")
const { formatExpression } = require("../../lib/helpers/StringHelpers/StringHelper")

module.exports.props = {
    commandName: "timeout",
    description: "Timeout a user in the server",
    usage: "/mute [user] [time] [reason]",
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
                    autocomplete: true
                },
            ],
        defaultMemberPermissions: ['KickMembers'],
    }
}
module.exports.autocomplete = async (client, interaction) => {
    const focusedReason = interaction.options.getFocused();

    // If the focused reason is the time, return the time options
    if (interaction.options.getFocused(true).name === "time") {
        // We could put this somewhere else, but I'll leave it here for now
        var time = [
            { name: "5 Minutes", value: 5 },
            { name: "10 Minutes", value: 10 },
            { name: "20 Minutes", value: 20},
            { name: "30 Minutes", value: 30 },
            { name: "1 Hour", value: 60 },
            { name: "2 Hours", value: 120 }
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
    // Get User details from the interaction options
    const targetUser = interaction.options.get("user").user;
    const targetMember = await interaction.guild.members.fetch(targetUser.id)

    // Prevent the author from muting themselves
    if (targetMember.user.id === interaction.user.id) return interaction.reply({
        content: `You cannot kick yourself.`,
        ephemeral: true
    });

    // Prevent the author from muting a moderator
    if (targetMember.permissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.reply({
        content: `You cannot mute a moderator.`,
        ephemeral: true
    });

    // Get the duration && reason from the interaction options
    const targetDuration = interaction.options.get("time").value;
    const targetReason = interaction.options.get("reason").value;

    // Convert the duration to milliseconds
    const duration = targetDuration * 60000;

    /**
     * @TODO - Add a warning to the database
     */

    // Mute the target user with reason
    targetMember.timeout(duration, `${targetReason}`)
        .then(() => {
            return interaction.reply({
                content: `Successfully muted <@${targetMember.user.id}> for: \n ${targetReason}}`,
                ephemeral: false,
            });
        })
        .catch(err => {
            return interaction.reply({
                content: `Could not mute <@${targetMember.user.id}>!`,
                ephemeral: true,
            });
        });
}