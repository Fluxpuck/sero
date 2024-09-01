const eventEnum = require('../config/eventEnum')
const { postRequest, getRequest } = require('../database/connection')

module.exports = async (client, message) => {
  if (!message.guild.active) return;

  // If the message is from a bot, return
  if (message.author.bot) return;

  // Check if the user is away.
  client.emit(eventEnum.GUILD_MEMBER_AWAY, message);

  /**
    * Check if the message author, the User, is is stored
    * If not, check if the User is in the database
    * If not, create the User in the database
    */
  if (!message.author.storage) {
    // Setup the User Storage Object
    let userStorage = {};

    // Get the User from the database
    const getUserResult = await getRequest(`/guilds/${message.guildId}/users/${message.author.id}`);

    // If the User is not in the Database, store it
    if (!getUserResult || getUserResult.status === 404) {
      const saveUserResult = await postRequest(`/guilds/${message.guildId}/users`, {
        userId: message.author.id,
        userName: message.author.username
      })

      if (saveUserResult?.status === 200) {
        userStorage = saveUserResult.data.data
      }
    }

    if (getUserResult?.status === 200) {
      userStorage = getUserResult.data
    }

    // Add the userStorage to the User object
    if (userStorage) message.author.storage = userStorage;
  } else {
    // Create a cooldownKey based on the userId and guildId
    const cooldownKey = `${message.author.id}_${message.guildId}`;

    /**
      * This code will get a message per 60 seconds cooldown
      * And will add experience to the user's level
      */
    if (client.cooldowns.has(cooldownKey) === false) {

      // Update the User's experience
      const result = await postRequest(`/guilds/${message.guildId}/levels/exp/gain/${message.author.id}`);
      const { previous, current } = result.data;

      // Trigger guildMemberLevel event
      client.emit(eventEnum.GUILD_MEMBER_LEVEL, message, previous, current);

      // Add the user to the cooldowns Collection
      return client.cooldowns.set(cooldownKey, message, 60);
    }
  }
}
