/*  FluxBot © 2023 Fluxpuck
This event is triggers by Discord and does processing of data  */

module.exports = async (client, guild) => {

    // Remove guild from API
    const response = await deleteRequest(`/guilds/${guild.id}`);

    console.log(response.status, response.data)

    return;
}