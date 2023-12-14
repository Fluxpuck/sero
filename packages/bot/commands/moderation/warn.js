module.exports.props = {
    commandName: "warn",
    description: "Send a warning to a user in their DMs",
    usage: "/warn [user] [reason]",
    interaction: {
        type: 1,
        options: [
            {
                name: "pre-reasons",
                description: "Select a pre-defined reason to warn a user",
                type: 1,
                options: [
                    {
                        name: "user",
                        description: "Select a user to warn",
                        type: 6,
                        required: true
                    },
                    {
                        name: "reason",
                        description: "Select a pre-defined reason to warn",
                        type: 3,
                        required: true,
                        choices: [
                            {
                                name: "Spamming",
                                value: "Spamming in a chat that does not allow spamming"
                            },
                            {
                                name: "Harassment",
                                value: "Harrasing a user in a text channel or voice channel"
                            },
                            {
                                name: "NSFW",
                                value: "Posting NSFW content in a non-NSFW channel"
                            },
                            {
                                name: "Racism",
                                value: "Being racist towards a user or group of users"
                            }
                            // Will have to add more later
                        ]
                    }
                ]
            },
            {
                name: "custom-reason",
                description: "Type a reason for the warning",
                type: 1,
                options: [
                    {
                        name: "user",
                        description: "Select a user to warn",
                        type: 6,
                        required: true
                    },
                    {
                        name: "reason",
                        description: "Type a reason to warn the user",
                        type: 3,
                        required: true,
                    }
                ]
            }
        ]
    }
};

module.exports.run = async (client, interaction) => {

    const targetUser = interaction.options.get("user").user;
    const message = "Dear user, you have been warned for the following reason: " + interaction.options.get("reason").value;

    return targetUser.send(message)
    .then(() => {
        return interaction.reply({
            content: `Successfully warned <@${targetUser.id}> with the following message \n ${message}`,
            ephemeral: false,
        });
    }
    )
    .catch(err => {
        return interaction.reply({
            content: `Could not warn <@${targetUser.id}>, please try again later.`,
            ephemeral: true
        })
    });
};
