const { Collection } = require('discord.js');
const { subMinutes, isAfter } = require('date-fns');

module.exports = {

    /**
     * Fetches limited messages from a user in a channel with a timeout
     * @param {Interaction} interaction - The interaction object
     * @param {User?} user - The user to fetch the messages from (optional)
     * @param {number} amount - The amount of messages to fetch
     * @param {number} timeoutMs - Timeout in milliseconds (default: 3_000, 3 seconds)
     * @returns {Promise<Collection>} A collection of fetched messages
     */
    async fetchMessages(interaction, user, amount, timeoutMs = 3_000) {
        const FETCH_AMOUNT = 100; // Maximum number of messages to fetch per request

        const messageCollection = new Collection();
        const startTime = Date.now();
        let lastMessage = null;
        let keepFetching = true;

        try {
            while (keepFetching) {
                if (Date.now() - startTime >= timeoutMs) {
                    break;
                }

                const options = { limit: FETCH_AMOUNT, ...(lastMessage?.id && { before: lastMessage.id }) };
                const fetchedMessages = await interaction.channel.messages.fetch(options);

                if (fetchedMessages.size === 0) break;

                lastMessage = fetchedMessages.last();

                for (const [, message] of fetchedMessages) {
                    if (
                        !message.pinned &&
                        message.deletable &&
                        (!user || message.author.id === user.id)
                    ) {
                        messageCollection.set(message.id, message);
                        if (messageCollection.size >= amount) {
                            keepFetching = false;
                            break;
                        }
                    }
                }

                if (lastMessage && !lastMessage.deletable) break;
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        }

        return messageCollection;
    },

    /**
     * Get unique authors from the last X minutes of messages in a channel
     * @param {*} channel 
     * @param {*} time 
     * @returns 
     */
    async getUniqueAuthorsFromMessages(channel, time = 5) {

        // Fetch the last 100 messages in the channel
        const messages = await channel.messages.fetch({ limit: 100 });

        // Calculate the time 5 minutes ago
        const timeAgo = subMinutes(new Date(), time);

        // Filter messages from the last 5 minutes
        const recentMessages = messages.filter(msg => isAfter(msg.createdTimestamp, timeAgo));

        // Create an array with all unique message.author.id's
        const uniqueAuthorIds = [...new Set(recentMessages.map(msg => msg.author.id))];

        // Return the array of unique author IDs (will be empty if no messages match the criteria)
        return uniqueAuthorIds;
    }
};