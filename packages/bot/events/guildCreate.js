const { postRequest } = require('../database/connection');

module.exports = async (client, guild) => {
    await postRequest(`/guilds/${guild.id}`, {
        guild: {
            guildId: guild.id,
            guildName: guild.name,
        }
    })
}