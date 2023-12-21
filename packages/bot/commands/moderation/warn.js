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
    // Get User details from the interaction options
    const targetUser = interaction.options.get("user").user;

    // Create the private warning message
    const privateMessage = `<@${targetUser.id}>, you have been warned in **${interaction.guild.name}** for the following reason: ${interaction.options.get("reason").value}`;

    /**
     * @TODO - Add a warning to the database
     */

    // Send the private warning message to the target user
    return targetUser.send(privateMessage)
        .then(() => {
            return interaction.reply({
                content: `Successfully warned <@${targetUser.id}> with the following message \n ${privateMessage}`,
                ephemeral: false,
            });
        })
        .catch(err => {
            return interaction.reply({
                content: `Could not warn <@${targetUser.id}>, but warning has been logged`,
                ephemeral: true,
            });
        });
};
