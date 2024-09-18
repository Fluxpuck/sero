const { getRequest } = require('../database/connection');
const { LEVEL_MESSAGES } = require("../assets/level-messages");

module.exports = async (client, message, oldLevel, newLevel) => {

    if (!oldLevel || !newLevel) return;

    /**
     *  If the new level is higher than the old level, then the user has leveled up 
     *  Reply to the user with a message that they have leveled up
     */
    if (newLevel.level > oldLevel.level) {

        // Send a  level up message
        try {
            // Fetch the welcome channel
            const messageChannel = await getRequest(`/guilds/${message.guild.id}/settings/levelup-channel`);
            if (messageChannel.status === 200) {

                // Get channel from request
                const { channelId } = messageChannel.data
                const channel = await message.guild.channels.fetch(channelId);

                // Get a random message
                let idx = Math.floor(Math.random() * LEVEL_MESSAGES.length);
                const levelUpMessage = LEVEL_MESSAGES[idx].replace('{AUTHOR}', `<@${message.author.id}>`).replace('{LEVEL}', `${newLevel.level}`)

                // Send the welcome message
                channel.send(levelUpMessage);
            }
        } catch (error) {
            console.log(error)
        }

    }
}