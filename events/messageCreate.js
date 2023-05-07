/*  FluxBot © 2023 Fluxpuck
This event is triggers by Discord and does processing of data  */

// → Importing necessary modules, functions and classes
const { postRequest } = require("../database/connection");

module.exports = async (client, message) => {

    // If the message is from a bot, return
    if (message.author.bot) return;

    // Setting up the cooldown key
    const cooldownKey = `${message.guildId}/${message.author.name}`

    // If the user is not on a cooldown
    if (client.cooldowns.has(cooldownKey) == false) {

        // Call the postRequest function to gain points
        const response = await postRequest(`/leaderboard/gain/${message.guildId}/${message.author.id}`);

        // If the response status is 404 (not found), create a new entry in the leaderboard for the user and guild
        if (response.status == 404) {
            const response_2 = await postRequest(`/leaderboard/${message.guildId}/${message.author.id}`);
        }

        // Add the user to the cooldowns Collection
        client.cooldowns.set(cooldownKey, message, 60)
    }

    return;
}