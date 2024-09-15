const { getRequest, postRequest } = require("../../database/connection");

module.exports = async (client, member) => {

    // Deactivate the user to the database
    await postRequest(`/users/${member.guild.id}/${member.id}`, {
        userId: member.user.id,
        userName: member.user.tag,
        active: false
    })

}
