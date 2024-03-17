const { Collection } = require('discord.js');

module.exports = {

    /**
     * Fetches limited messages from a user in a channel
     * @param {Interaction} interaction - The interaction object
     * @param {User?} user - The user to fetch the messages from
     * @param {number} limit - The amount of messages to fetch
     */
    async fetchMessages(interaction, user, limit) {

        // Setup a collection to store the messages &&
        // a variable to store the last message id
        let messageCollection = new Collection();
        let lastMessageId = null;

        // Construct a timestamp for two weeks ago
        const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);

        // The remaining messages to fetch
        let remainingLimit = limit;

        try {

            // Loop through the messages until the limit is reached
            while (remainingLimit > 0) {

                // Set the fetch options and fetch the messages
                const options = { limit: Math.min(remainingLimit, 10), ...(lastMessageId ? { before: lastMessageId } : {}) };
                const fetchedMessages = await interaction.channel.messages.fetch(options);

                // Break if there are no messages
                if (!fetchedMessages.size) break;

                // Initialize an array to store messages to add to the collection
                let messagesToAdd = [];

                // Process each fetched message
                for (const [id, msg] of fetchedMessages) {
                    // Check if the message meets the filtering criteria
                    if (!msg.pinned && msg.createdTimestamp > twoWeeksAgo && (!user || msg.author.id === user.id)) {
                        // Add the message to the array of messages to add
                        messagesToAdd.push([id, msg]);
                        // Decrement the remaining limit
                        remainingLimit--;
                        // Break if the limit has been reached
                        if (remainingLimit <= 0) break;
                    }
                }

                // Concatenate the array of messages to add to the collection
                messageCollection = messageCollection.concat(messagesToAdd);

                // If there are no messages, or the last message is older than two weeks ago, break
                const lastMessage = fetchedMessages.last();
                if (!lastMessage || lastMessage.createdTimestamp < twoWeeksAgo) break;

                // Update the last message id
                lastMessageId = lastMessage.id;
            }

            // Return the message collection
            return messageCollection;

        } catch (error) {
            // Handle errors with detailed information
            console.error(`Error [MessageResolver, fetchMessages]:`, error);

            // Return empty collection
            return messageCollection;
        }
    }
};