const { MUTE_PREREASONS } = require("../../assets/reason-messages");
const { formatExpression } = require("../../lib/helpers/StringHelpers/stringHelper");

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
                    autocomplete: true,
                    maxLength: 100
                },
            ],
        defaultMemberPermissions: ['ModerateMembers'],
    }
}

module.exports.autocomplete = async (client, interaction) => {
    const focusedReason = interaction.options.getFocused();

    // If the focused reason is the time, return the time options
    if (interaction.options.getFocused(true).name === "time") {
        // We could put this somewhere else, but I'll leave it here for now
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
    // Get User details from the interaction options && convert user into a member object.
    const targetUser = interaction.options.get("user").user;

    // Fetch the user by userId
    const member = await interaction.guild.members.fetch(targetUser.id)

    // If the target is the author, return message
    if (member.user.id === interaction.user.id) return interaction.reply({
        content: "You cannot mute yourself!",
        ephemeral: true
    });

    // If the member is not moderatable, return message
    if (!member.moderatable) return interaction.reply({
        content: `<@${member.user.id}> is a moderator!`,
        ephemeral: true
    });

    // Check if the member has left the server before proceeding.
    if(!member) return interaction.reply({
        content: `<@${member.user.id}> does not exist within the server!`,
        ephemeral: true
    })

    // Get the duration && reason from the interaction options
    const targetDuration = interaction.options.get("time").value;
    const targetReason = interaction.options.get("reason").value;

    // Convert the duration to milliseconds
    const duration = parseFloat(targetDuration) * 60 * 1000;

    // Mute the target user with reason
    member.timeout(duration, `${targetReason}`)
        .then(() => {
            return interaction.reply({
                content: `You successfully muted <@${member.user.id}> for:\n> ${targetReason}`,
                ephemeral: true,
            });
        })
        .catch(err => {
            return interaction.reply({
                content: `Could not mute <@${member.user.id}>!`,
                ephemeral: true,
            });
        });
}