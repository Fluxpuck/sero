const { deleteRequest } = require("../database/connection");

module.exports = async (client, member) => {
    await deleteRequest(`/users/deactivate/${member.guild.id}/${member.id}}`);
    return;
}