const eventEnum = require('../config/eventEnum')
const { postRequest, getRequest } = require('../database/connection')

module.exports = async (client, message) => {
  if (!message.guild.active) return;

  // If the message is from a bot, return
  if (message.author.bot) return;

  // Create a cooldown key based on the userId, guildId and event Enum
  const user_key = `${message.author.id}_${message.guildId}`;
  const timer = 60 * 60 * 1 // 1 hour timer
  if (client.cooldowns.has(user_key) === false) {

    // Create or update the user
    const result = await postRequest(`/guilds/${message.guildId}/users`,
      { userId: message.author.id, userName: message.author.username });

    if (result.status === 200) {
      const userData = result.data.user ?? false;

      if (process.env.NODE_ENV === "development") {
        console.log("\x1b[36m", `[Client]: ${message.author.username} stored successfully.`);
      }

      // Add the user to the cooldowns Collection
      return client.cooldowns.set(user_key, userData, timer);
    }
  }

  // Check if the user is away
  client.emit(eventEnum.GUILD_MEMBER_AWAY, message);

  // Create a cooldown key based on the userId, guildId and event Enum
  const user_level_key = `${message.author.id}_${message.guildId}_${eventEnum.GUILD_MEMBER_LEVEL}`;

  /**
  * This code will execute per 60 seconds
  * Add experience to the user's level
  */
  if (client.cooldowns.has(user_level_key) === false) {
    // Update the User's experience
    const result = await postRequest(`/guilds/${message.guildId}/levels/exp/gain/${message.author.id}`);
    const { previous, current } = result.data;

    // Trigger guildMemberLevel event
    client.emit(eventEnum.GUILD_MEMBER_LEVEL, message, previous, current);

    // Add the user to the cooldowns Collection
    return client.cooldowns.set(user_level_key, message, 60);
  }


  // Store message to the database
  postRequest(`/guilds/${message.guildId}/messages`, {
    messageId: message.id,
    channelId: message.channelId,
    userId: message.author.id,
  });

}
