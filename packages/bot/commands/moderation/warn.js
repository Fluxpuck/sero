const { WARN_PREREASONS } = require("../../assets/reason-messages");
const { formatExpression } = require("../../lib/helpers/StringHelpers/stringHelper");

module.exports.props = {
    commandName: "warn",
    description: "Send a warning to a user in their DMs",
    usage: "/warn [user] (reason)",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                description: "Select a user to warn",
                type: 6,
                required: true,
            },
            {
                name: "reason",
                description: "Type a reason to warn the user",
                type: 3,
                required: true,
                autocomplete: true,
                maxLength: 100
            },
        ],
        defaultMemberPermissions: ['KickMembers'],
    },
};

module.exports.autocomplete = async (client, interaction) => {
    const focusedReason = interaction.options.getFocused();

    // Get and format the pre-reasons
    const reasons = Object.keys(WARN_PREREASONS).map(reason =>
        ({ name: formatExpression(reason), value: WARN_PREREASONS[reason] })
    );

    // Get the focussed reason && return the filtered reason
    const filteredReasons = reasons.filter(reason => reason.name.toLowerCase().includes(focusedReason.toLowerCase()));
    interaction.respond(filteredReasons);
}


module.exports.run = async (client, interaction) => {
    // Get User details from the interaction options
    const targetUser = interaction.options.get("user").user;

    // Fetch the user by userId
    const member = await interaction.guild.members.fetch(targetUser.id)

    // If the target is the author, return message
    if (member.user.id === interaction.user.id) return interaction.reply({
        content: "You cannot warn yourself!",
        ephemeral: true
    });

    // If the member is not moderatable, return message
    if (!member.moderatable) return interaction.reply({
        content: `<@${member.user.id}> is a moderator!`,
        ephemeral: true
    });

    // Create the private warning message
    const privateMessage = `<@${member.user.id}>, you have been warned in **${interaction.guild.name}** for the following reason: ${interaction.options.get("reason").value}`;

    // Send the private warning message to the target user
    return member.send(privateMessage)
        .then(() => {
            return interaction.reply({
                content: `Successfully warned <@${member.user.id}> with the following message:\n> ${privateMessage}`,
                ephemeral: false,
            });
        })
        .catch(err => {
            return interaction.reply({
                content: `Could not warn <@${member.user.id}>, but warning has been logged`,
                ephemeral: true,
            });
        });
};
