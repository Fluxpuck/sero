const { fetchMessages } = require("../../lib/resolvers/messageResolver");
const { deferInteraction, replyInteraction } = require('../../utils/InteractionManager');

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
    await deferInteraction(interaction, true);

    // Get User && Amount details from the interaction options
    const targetUser = interaction.options.get("user")?.user;
    const targetAmount = interaction.options.get("amount").value;

    // Start the interaction reply
    await replyInteraction(interaction, {
        content: `*Deleting **${targetAmount}** messages${targetUser ? ` from **${targetUser.tag}**` : ""}...*`,
        ephemeral: true
    });

    // Fetch the messages based on user? and amount
    const messageCollection = await fetchMessages(interaction, targetUser, targetAmount);

    // Check if the collection is not empty
    if (messageCollection.size > 0) {
        // Delete the messages from the channel
        const deletedMessages = await interaction.channel.bulkDelete(messageCollection, true).catch(err => { console.warn(err) });

        // Return confirmation message to the user
        await replyInteraction(interaction, {
            content: `Deleted **${deletedMessages.size}** messages${targetUser ? ` from **${targetUser.tag}**` : ""}`,
            ephemeral: true,
        });

        // Clear the message collection
        return messageCollection.clear();
    } else {
        return replyInteraction(interaction, {
            content: `Oops! I couldn't find any messages${targetUser ? ` from **${targetUser.tag}**` : ""} to delete!`,
            ephemeral: true,
        });
    }
}