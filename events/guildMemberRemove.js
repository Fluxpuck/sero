/*  FluxBot © 2023 Fluxpuck
This event is triggers by Discord and does processing of data  */

// → Importing necessary modules, functions and classes
const { deleteRequest } = require("../database/connection");

module.exports = async (client, member) => {

    // Remove Guild Member from API
    const response = await deleteRequest(`/users/${member.guild.id}/${member.id}}`);

    console.log(response.status, response.data)

    return;
}