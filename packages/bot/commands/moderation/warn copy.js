const { WARN_PREREASONS } = require("../../assets/pre-reasons");
module.exports.props = {
    commandName: "warntest",
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
    const reasons = WARN_PREREASONS;
    interaction.respond(
        reasons.filter(reason => reason.name.toLowerCase().includes(focusedReason.toLowerCase()))
    );

}


module.exports.run = async (client, interaction) => {
    const targetUser = interaction.options.get("user").user;
    const message =
        "Dear user, you have been warned for the following reason: " + interaction.options.get("reason").value;

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
};
