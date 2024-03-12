const { fetchMessages } = require("../../lib/resolvers/MessageResolver");

module.exports.props = {
    commandName: "purge",
    description: "Purge messages (from a user)",
    usage: "/purge [amount] [user]",
    interaction: {
        type: 1,
        options: [
            {
                name: "amount",
                type: 10,
                description: "The amount of messages to delete",
                required: true,
                minValue: 1,
                maxValue: 100,
            },
            {
                name: "user",
                type: 6,
                description: "Select a user to delete messages from",
                required: false
            }
        ],
    },
    defaultMemberPermissions: ['ManageMessages'],
}

module.exports.run = async (client, interaction) => {
    try {
        // Get User && Amount details from the interaction options
        const targetUser = interaction.options.get("user")?.user
        const targetAmount = interaction.options.get("amount").value;

        // Fetch the messages based on user? and amount
        const messageCollection = await fetchMessages(interaction, targetUser, targetAmount);

        // Check if the collection is not empty
        if (messageCollection.size <= 0) {
            throw new Error(`Oops! I couldn't find any messages ${targetUser ? `from ${targetUser.user.username}` : ""} to delete!`);
        }

        // Bulk delete the messages
        if (messageCollection >= 1) {
            interaction.channel.bulkDelete(messageCollection)
                .then(() => {
                    return interaction.reply({
                        content: `Deleting ${messageCollection.size} messages ${targetUser ? `from ${targetUser.tag}` : ""}`,
                        ephemeral: true,
                    });
                })
        }

        // Clear the messageCollection
        return messageCollection.clear();

    } catch (error) {
        return interaction.reply({
            content: `${error.message}`,
            ephemeral: true
        })
    }
}