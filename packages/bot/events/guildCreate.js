const { postRequest } = require('../database/connection');

module.exports = async (client, guild) => {

    console.log(`[GUILD CREATE]: ${guild.name} (${guild.id}) added the bot.`);

    // Post the guild to the API
    await postRequest(`/guilds/${guild.id}`, {
        guild: {
            guildId: guild.id,
            guildName: guild.name,
            active: false
        }
    })
}