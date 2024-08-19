const { deleteRequest } = require("../../database/connection");

module.exports = async (client, guild) => {
    await deleteRequest(`/guilds/deactivate/${guild.id}`);
    return;
}