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

        // Loop through the messages until the limit is reached
        while (messageCollection.size < limit) {
            const options = { limit: 100, ...(lastMessageId ? { before: lastMessageId } : {}) };
            const fetchedMessages = await interaction.channel.messages.fetch(options);

            // Filter out the messages by pinned and two weeks old
            let filteredMessages = fetchedMessages.filter(msg => !msg.pinned && msg.createdTimestamp > twoWeeksAgo);
            if (user) { filteredMessages = filteredMessages.filter(msg => msg.author.id === user.id) };

            // Add the filtered messages to the collection
            for (const [id, msg] of filteredMessages) {
                if (messageCollection.size >= limit) break;
                messageCollection.set(id, msg);
            }

            // If there are no messages, or the last message is older than two weeks ago, break
            const lastMessage = fetchedMessages.last();
            if (!lastMessage || lastMessage.createdTimestamp < twoWeeksAgo) break;

            // Update the last message id
            lastMessageId = lastMessage.id;
        }

        // Return the message collection
        return messageCollection;
    }
};