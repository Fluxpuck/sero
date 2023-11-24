const { postRequest } = require("../database/connection");

module.exports = async (client, member) => {
    await postRequest(`/users/${member.guild.id}/${member.id}`, {
        user: {
            userId: member.user.id,
            userName: member.user.tag
        }
    })
}