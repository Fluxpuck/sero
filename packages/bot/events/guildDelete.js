const { deleteRequest } = require("../database/connection");

module.exports = async (client, guild) => {

    console.log(`[GUILD DELETE]: ${guild.name} (${guild.id}) removed the bot.`);

    // Delete the guild from the API
    await deleteRequest(`/guilds/deactivate/${guild.id}`);
}