const { Collection } = require('discord.js');

module.exports = {

    /**
     * Fetches limited messages from a user in a channel
     * @param {Interaction} interaction - The interaction object
     * @param {User?} user - The user to fetch the messages from
     * @param {number} amount - The amount of messages to fetch
     */
    async fetchMessages(interaction, user, amount) {

        // Setup a collection to store the messages &&
        // a variable to store the last message id
        let messageCollection = new Collection();
        let lastMessageId = null;
        let fetchedCount = 0; // Track the total number of messages fetched

        // Construct a timestamp for 10 days ago
        const tenDaysAgo = Date.now() - (10 * 24 * 60 * 60 * 1000);

        // Fetch messages until the amount is reached or no more messages are available
        while (fetchedCount < amount) {
            // Calculate the remaining amount to fetch
            const remainingAmount = amount - fetchedCount;

            // Set the fetch options and fetch the messages
            const options = { limit: Math.min(remainingAmount, 20), ...(lastMessageId ? { before: lastMessageId } : {}) };
            const fetchedMessages = await interaction.channel.messages.fetch(options);

            // Break if there are no messages
            if (!fetchedMessages.size) break;

            // Process each fetched message
            fetchedMessages.forEach(msg => {
                // Check if the message meets the filtering criteria
                if (!msg.pinned && msg.createdTimestamp > tenDaysAgo && (!user || msg.author.id === user.id)) {
                    // Add the message to the collection
                    messageCollection.set(msg.id, msg);
                    fetchedCount++; // Increment the fetched count
                }
            });

            // Update lastMessageId
            lastMessageId = fetchedMessages.lastKey();

            // Break if the total number of fetched messages equals the amount
            if (fetchedCount === amount) break;
        }

        // Return the message collection
        return messageCollection;

    }
};