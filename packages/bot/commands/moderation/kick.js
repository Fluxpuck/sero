const { KICK_PREREASONS } = require("../../assets/reason-messages");
const { formatExpression } = require("../../lib/helpers/StringHelpers/stringHelper");

module.exports.props = {
    commandName: "kick",
    description: "Kick a user from the server",
    usage: "/kick [user] [reason]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                description: "User to kick",
                type: 6,
                required: true,
            },
            {
                name: "reason",
                description: "Reason for the kick",
                type: 3,
                required: true,
                autocomplete: true,
                maxLength: 100
            },
        ],
    },
    defaultMemberPermissions: ['KickMembers'],
};

module.exports.autocomplete = async (client, interaction) => {
    const focusedReason = interaction.options.getFocused();

    // Get and format the pre-reasons
    const reasons = Object.keys(KICK_PREREASONS).map(reason =>
        ({ name: formatExpression(reason), value: KICK_PREREASONS[reason] })
    );

    // Get the focussed reason && return the filtered reason
    const filteredReasons = reasons.filter(reason => reason.name.toLowerCase().includes(focusedReason.toLowerCase()));
    interaction.respond(filteredReasons);
}

module.exports.run = async (client, interaction) => {
    // Get User && Member && Reason details from the interaction options
    const targetUser = interaction.options.get("user").user;
    const violationReason = interaction.options.get("reason").value;

    // Fetch the user by userId
    const member = await interaction.guild.members.fetch(targetUser.id)

    // If the target is the author, return message
    if (member.user.id === interaction.user.id) return interaction.reply({
        content: "You cannot kick yourself!",
        ephemeral: true
    });

    // If the member is not moderatable, return message
    if (!member.moderatable) return interaction.reply({
        content: `<@${member.user.id}> is a moderator!`,
        ephemeral: true
    });

    // Kick the target member with reason
    return member.kick(violationReason)
        .then(() => {
            return interaction.reply({
                content: `Successfully kicked **${member.user.username}** (${member.user.id}) for:\n> ${violationReason}`,
                ephemeral: false,
            });
        })
        .catch(err => {
            return interaction.reply({
                content: `Could not kick **${member.user.username}** (${member.user.id})!`,
                ephemeral: true,
            });
        });
}