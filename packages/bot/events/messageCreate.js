const eventEnum = require('../config/eventEnum')
const { postRequest } = require('../database/connection')
const { getGuildActiveStatus } = require('../utils/cache/guild.cache')

module.exports = async (client, message) => {

    // Check if the guild from the interaction is active
    const isActive = await getGuildActiveStatus(message.guild.id);
    if (!isActive) return;

    // If the message is from a bot, return
    if (message.author.bot) return;

    // Create a cooldown key based on the userId, guildId and event Enum
    const user_key = `${message.author.id}_${message.guildId}_message`;
    const timer = 1 * 60 * 60; // Hours * Minutes * Seconds
    if (client.cooldowns.has(user_key) === false) {

        // Create or update the user
        const result = await postRequest(`/guilds/${message.guildId}/users`,
            { userId: message.author.id, userName: message.author.username });

        if (result?.status === 200) {
            const userData = result.data.user ?? false;

            if (process.env.NODE_ENV === "development") {
                console.log("\x1b[36m", `[Client]: ${message.author.username} stored successfully.`);
            }

            // Add the user to the cooldowns Collection
            client.cooldowns.set(user_key, userData, timer);
        }
    }

    // Check if the user is away
    client.emit(eventEnum.GUILD_MEMBER_AWAY, message);

    // Create a cooldown key based on the userId, guildId and event Enum
    const user_level_key = `${message.author.id}_${message.guildId}_${eventEnum.GUILD_MEMBER_LEVEL}`;

    // Check if the user is on a cooldown
    if (client.cooldowns.has(user_level_key) === false) {
        // Update the User's experience
        postRequest(`/guilds/${message.guildId}/levels/exp/gain/${message.author.id}`);

        // Add the user to the cooldowns Collection
        client.cooldowns.set(user_level_key, message, 60); // 60 seconds
    }

    // Store message to the database
    postRequest(`/guilds/${message.guildId}/messages`, {
        messageId: message.id,
        channelId: message.channelId,
        userId: message.author.id,
    });
}
