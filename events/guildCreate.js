/*  FluxBot © 2023 Fluxpuck
This event is triggers by Discord and does processing of data  */

// → Importing necessary modules, functions and classes
const { postRequest } = require('../database/connection');

module.exports = async (client, guild) => {

    // Save guild to API
    const response = await postRequest(`/guilds/${guild.id}`, {
        guild: {
            guildId: guild.id,
            guildName: guild.name,
        }
    })

    console.log(response.status, response.data)

    return;
}