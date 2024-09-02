const eventEnum = require('../config/eventEnum')
const { createCustomEmbed } = require("../assets/embed");
const { getRequest, deleteRequest } = require("../database/connection");
const { getTimeAgo } = require('../lib/helpers/TimeDateHelpers/timeHelper');

module.exports = async (client, message) => {

    /**
     * Check if the message is mentioning someone
     * If it is mentioning someone, check if the mentioned user is away
     */
    const messageMention = message.mentions.users.first();
    const memberId = messageMention ? messageMention.id : message.author.id

    // Check if the author is away
    const awayResult = await getRequest(`/guilds/${message.guildId}/away/${memberId}`);
    if (awayResult?.status == 200) {

        // If the user is the same as the author, remove away from database
        if (memberId === message.author.id) {
            await deleteRequest(`/guilds/${message.guildId}/away/${memberId}`);

            // Return the message
            message.reply(
                { content: `Welcome back <@${message.author.id}>! Your away status has been removed!` }
            ).then(msg => {
                setTimeout(() => {
                    msg.delete();
                }, 4000); // 4 seconds
            }).catch(e => { });

        }
        // Return if the user mentions themselves.
        if (memberId === message.author.id) {
            return;
        }

        /**
        * This code will execute per 60 seconds
        * Reply with the user's away status
        */
        const user_away_key = `${message.author.id}_${message.guildId}_${eventEnum.GUILD_MEMBER_AWAY}`;
        if (client.cooldowns.has(user_away_key) === false) {

            // Calculate time difference
            const timeDifference = getTimeAgo(awayResult.data.updatedAt);

            // Construct message Embed
            const messageEmbed = createCustomEmbed({
                author: {
                    name: `${messageMention ? messageMention.username : message.author.username} is currently away...`,
                    iconURL: messageMention ? messageMention.avatarURL() : message.author.avatarURL()
                },
                ...awayResult.data.message && { description: `${awayResult.data.message}` }, // Conditionally add the description
                footer: {
                    text: `${timeDifference}`,
                }
            })

            // Return the message
            message.channel.send({
                embeds: [messageEmbed]
            }).then(msg => {
                setTimeout(() => {
                    msg.delete();
                }, 5000); // 5 seconds
            });

            // Add the user to the cooldowns Collection
            return client.cooldowns.set(user_away_key, message, 60)
        }
    }
}