const { BAN_PREREASONS } = require("../../assets/reason-messages");
const { formatExpression } = require("../../lib/helpers/StringHelpers/stringHelper");

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
                maxLength: 100,
            },
        ],
    },
    defaultMemberPermissions: ['BanMembers'],
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
    await interaction.deferReply({ ephemeral: true });

    // Get User && Reason details from the interaction options && convert user into a member
    const targetUser = interaction.options.get("user").user;
    const violationReason = interaction.options.get("reason").value;

    // Fetch the user by userId
    const member = await interaction.guild.members.fetch(targetUser.id)

    // If the target is the author, return message
    if (member.user.id === interaction.user.id) return interaction.editReply({
        content: "You cannot ban yourself!",
        ephemeral: true
    });

    // If the member is not moderatable, return message
    if (!member.moderatable) return interaction.editReply({
        content: `<@${member.user.id}> is a moderator!`,
        ephemeral: true
    });

    // Ban the target user with reason
    member.ban({ reason: violationReason, days: null })
        .then(() => {
            return interaction.editReply({
                content: `You successfully banned **${member.user.username}** (${member.user.id}) for:\n> ${violationReason}`,
                ephemeral: true,
            });
        })
        .catch(err => {
            return interaction.editReply({
                content: `Could not ban **${member.user.username}** (${member.user.id})!`,
                ephemeral: true,
            });
        });
}