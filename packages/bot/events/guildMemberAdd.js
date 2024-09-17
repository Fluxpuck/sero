const { getRequest, postRequest } = require("../database/connection");
const { WELCOME_MESSAGES } = require("../assets/welcome-messages");

module.exports = async (client, member) => {

    // Add new user to the database
    await postRequest(`/users/${member.guild.id}/${member.id}`, {
        user: {
            userId: member.user.id,
            userName: member.user.tag
        }
    })

    // Send a welcome message
    try {
        // Fetch the welcome channel
        const welcomeChannel = await getRequest(`/guilds/${member.guild.id}/settings/welcome-channel`);
        if (welcomeChannel.status === 200) {

            // Get channel from request
            const { channelId } = welcomeChannel.data
            const channel = await member.guild.channels.fetch(channelId);

            // Select a random welcome message
            const text_idx = Math.floor(Math.random() * WELCOME_MESSAGES.length);
            const text_content = WELCOME_MESSAGES[text_idx];

            // Send the welcome message
            channel.send(`# Welcome <@${member.user.id}> \n` + text_content.replace("{name}", `**${member.user.username}**`));
        }
    } catch (error) {
        console.log(error)
    }



}