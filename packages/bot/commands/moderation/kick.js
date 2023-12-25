const { KICK_PREREASONS } = require("../../assets/reason-messages");
const { formatExpression } = require("../../lib/helpers/StringHelpers/StringHelper")

module.exports.props = {
    commandName: "kick",
    description: "Kicks a user from the server.",
    usage: "/kick [user] [reason]",
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
            },
        ],
    },
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
    // Get User && Reason details from the interaction options
    const targetUser = interaction.options.get("user").user;
    const violationReason = interaction.options.get("reason").value;

    // If the targetUser === Author, return message
    if (targetUser.id === interaction.user.id) return interaction.reply({
        content: "You cannot kick yourself!",
        ephemeral: true
    })

    /**
     * @TODO - Add a warning to the database
     */

    // Kick the target user with reason
    return targetUser.kick(violationReason)
        .then(() => {
            return interaction.reply({
                content: `Successfully kicked **${targetUser.username}** (${targetUser.id}) for: \n ${violationReason}`,
                ephemeral: false,
            });
        })
        .catch(err => {
            return interaction.reply({
                content: `Could not kick **${targetUser.username}** (${targetUser.id}), but a log was created`,
                ephemeral: true,
            });
        });
}