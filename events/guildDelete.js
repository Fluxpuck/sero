/*  FluxBot © 2023 Fluxpuck
This event is triggers by Discord and does processing of data  */

// → Importing necessary modules, functions and classes
const { deleteRequest } = require("../database/connection");

module.exports = async (client, guild) => {

    // Remove guild from API
    await deleteRequest(`/guilds/${guild.id}`);

    return;
}