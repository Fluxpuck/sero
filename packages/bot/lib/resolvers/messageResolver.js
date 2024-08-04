const { Collection } = require('discord.js');

module.exports = {

    /**
     * Fetches limited messages from a user in a channel
     * @param {Interaction} interaction - The interaction object
     * @param {User?} user - The user to fetch the messages from
     * @param {number} amount - The amount of messages to fetch
     */
    async fetchMessages(interaction, user, amount) {

        const FETCH_AMOUNT = 100; // Maximum number of messages to fetch per request

        // Setup a collection to store the messages &&
        // a variable to store the last message
        // a variable to keep fetching messages
        // and a variable to store the fetched count
        let messageCollection = new Collection();
        let lastMessage = null;
        let keepFetching = true;

        // Set a timestamp for 10 seconds from now
        const timeLimit = Date.now() + 10 * 1000;

        while (keepFetching) {

            // Set the fetch options and fetch the messages
            const options = { limit: FETCH_AMOUNT, ...(lastMessage?.id ? { before: lastMessage?.id } : {}) };
            const fetchedMessages = await interaction.channel.messages.fetch(options);

            // Break if there are no messages fetched
            if (!fetchedMessages.size) keepFetching = false;

            // Set the last fetched message
            lastMessage = fetchedMessages.last();

            // Process each fetched message
            fetchedMessages.forEach(message => {

                // Check if the message meets the filtering criteria
                if (
                    !message.pinned && // Message is not pinned
                    message.deletable && // Message is deletable
                    (!user || message.author.id === user.id) // Message is from the user (if provided)
                ) {

                    // Add the message to the collection if the size is less than the amount
                    if (messageCollection.size < amount) {
                        // Add the message to the collection
                        messageCollection.set(message.id, message);
                    }

                    // Break if the desired amount is reached
                    if (messageCollection.size >= amount) keepFetching = false;

                }

            });

            // Break if last message is not deletable
            if (lastMessage && !lastMessage.deletable) keepFetching = false;

            // Break if the time is up
            if (Date.now() >= timeLimit) keepFetching = false;

        }

        // Return the message collection
        return messageCollection;

    }
};