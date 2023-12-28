const { PermissionFlagsBits } = require("discord.js");
const { BAN_PREREASONS } = require("../../assets/reason-messages");
const { formatExpression } = require("../../lib/helpers/StringHelpers/StringHelper")

module.exports.props = {
    commandName: "ban",
    description: "Ban a user from the server",
    usage: "/ban [user] [reason]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                description: "User to ban",
                type: 6,
                required: true,
            },
            {
                name: "reason",
                description: "Reason for the ban",
                type: 3,
                required: true,
                autocomplete: true,
            },
        ],
        defaultMemberPermissions: ['KickMembers'],
    },
};

module.exports.autocomplete = async (client, interaction) => {
    const focusedReason = interaction.options.getFocused();

    // Get and format the pre-reasons
    const reasons = Object.keys(BAN_PREREASONS).map(reason =>
        ({ name: formatExpression(reason), value: BAN_PREREASONS[reason] })
    );

    // Get the focussed reason && return the filtered reason
    const filteredReasons = reasons.filter(reason => reason.name.toLowerCase().includes(focusedReason.toLowerCase()));
    interaction.respond(filteredReasons);
}

module.exports.run = async (client, interaction) => {
    // Get User && Reason details from the interaction options
    const targetUser = interaction.options.get("user").user;
    const violationReason = interaction.options.get("reason").value;

    // If the targetUser === Author, return message
    if (targetUser.id === interaction.user.id) return interaction.reply({
        content: "You cannot ban yourself!",
        ephemeral: true
    })
    // If the targetUser has permission "ModerateMembers" do not ban.
    if (member.permissions.has(PermissionFlagsBits.ModerateMembers)) return interaction.reply({
        content: `${member.user.username} is a moderator!`,
        ephemeral: true
    })

    /**
     * @TODO - Add a ban to the database
     */

    // Ban the target user with reason
    return targetUser.ban(violationReason)
        .then(() => {
            return interaction.reply({
                content: `Successfully banned **${targetUser.username}** (${targetUser.id}) for: \n ${violationReason}`,
                ephemeral: false,
            });
        })
        .catch(err => {
            return interaction.reply({
                content: `Could not ban **${targetUser.username}** (${targetUser.id})!`,
                ephemeral: true,
            });
        });
}