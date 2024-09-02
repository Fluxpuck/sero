const { deleteRequest } = require("../database/connection");

module.exports = async (client, member) => {

    // Deactivate user in database
    await deleteRequest(`/users/deactivate/${member.guild.id}/${member.id}}`);









    return;
}