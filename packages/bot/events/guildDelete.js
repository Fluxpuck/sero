/*  FluxBot © 2023 Fluxpuck
This event is triggers by Discord and does processing of data  */

// → Importing necessary modules, functions and classes
const { deleteRequest } = require("../database/connection");

module.exports = async (client, guild) => {

    // Deactivate guild from API
    await deleteRequest(`/guilds/deactivate/${guild.id}`);

    return;
}