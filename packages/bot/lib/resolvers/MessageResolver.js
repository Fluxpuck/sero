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

        try {
            // The remaining messages to fetch
            let remainingLimit = limit;

            // Loop through the messages until the limit is reached
            while (remainingLimit > 0) {

                // Filter out the messages by pinned and two weeks old
                const options = { limit: Math.min(remainingLimit, 100), ...(lastMessageId ? { before: lastMessageId } : {}) };
                const fetchedMessages = await interaction.channel.messages.fetch(options);

                // Break if there are no messages
                if (!fetchedMessages.size) break;

                let addedMessages = 0;
                // Filter out the messages by pinned and two weeks old
                for (const [id, msg] of fetchedMessages) {
                    if (!msg.pinned && msg.createdTimestamp > twoWeeksAgo && (!user || msg.author.id === user.id)) {
                        // Add the message to the collection
                        messageCollection.set(id, msg);
                        // Increment the added messages
                        addedMessages++;
                        // Break if the limit is reached
                        if (addedMessages >= remainingLimit) break;
                    }
                }

                // Update the remaining limit
                remainingLimit -= addedMessages;

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

            // Return false if an error occurred
            return false;
        }
    }
};