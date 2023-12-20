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
            },
        ],
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
    const targetUser = interaction.options.get("user").user;
    const message =
        "Dear user, you have been warned for the following reason: " + interaction.options.get("reason").value;

    try {
        return targetUser
            .send(message)
            .then(() => {
                return interaction.reply({
                    content: `Successfully warned <@${targetUser.id}> with the following message \n ${message}`,
                    ephemeral: false,
                });
            })
            .catch(err => {
                return interaction.reply({
                    content: `Could not warn <@${targetUser.id}>, please try again later.`,
                    ephemeral: true,
                });
            });
    } catch (error) {
        console.log(error)
    }

};
