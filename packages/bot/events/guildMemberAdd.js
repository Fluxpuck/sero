/*  FluxBot © 2023 Fluxpuck
This event is triggers by Discord and does processing of data  */

// → Importing necessary modules, functions and classes
const { postRequest } = require("../database/connection");

module.exports = async (client, member) => {

    // Save Guild Member to API
    await postRequest(`/users/${member.guild.id}/${member.id}`, {
        user: {
            userId: member.user.id,
            userName: member.user.tag
        }
    })

    return;
}