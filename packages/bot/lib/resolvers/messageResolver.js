const { Collection } = require('discord.js');

module.exports = {

    /**
     * Fetches limited messages from a user in a channel with a timeout
     * @param {Interaction} interaction - The interaction object
     * @param {User?} user - The user to fetch the messages from (optional)
     * @param {number} amount - The amount of messages to fetch
     * @param {number} timeoutMs - Timeout in milliseconds (default: 5000)
     * @returns {Promise<Collection>} A collection of fetched messages
     */
    async fetchMessages(interaction, user, amount, timeoutMs = 5000) {
        const FETCH_AMOUNT = 100; // Maximum number of messages to fetch per request

        const messageCollection = new Collection();
        const startTime = Date.now();
        let lastMessage = null;
        let keepFetching = true;

        try {
            while (keepFetching) {
                if (Date.now() - startTime >= timeoutMs) {
                    console.log('Fetch operation timed out');
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
    }
};