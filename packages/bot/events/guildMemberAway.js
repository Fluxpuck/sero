const moment = require('moment');
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
    const awayResult = await getRequest(`/away/${message.guildId}/${memberId}`);
    if (awayResult.status == 200) {

        // If the user is the same as the author, remove away from database
        if (memberId === message.author.id) {
            await deleteRequest(`/away/${message.guildId}/${memberId}`);

            // Return the message
            message.reply(
                { content: `Welcome back <@${message.author.id}>! Your away status has been removed!` }
            ).then(msg => {
                setTimeout(() => {
                    msg.delete();
                }, 4000); // 4 seconds
            });

        }
        // Return if the user mentions themselves.
        if (memberId === message.author.id) {
            return;
        }

        /**
         * This code whas a one minute cooldown per user
         */
        const cooldownKey = memberId + message.guildId
        if (client.cooldowns.has(cooldownKey) === false) {

            // Calculate time difference
            const timeDifference = getTimeAgo(awayResult.data.updatedAt);

            // Construct message Embed
            const messageEmbed = createCustomEmbed({
                author: {
                    name: `${messageMention ? messageMention.username : message.author.username} is currently away...`,
                    iconURL: messageMention ? messageMention.avatarURL() : message.author.avatarURL()
                },
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
            return client.cooldowns.set(cooldownKey, message, 60)
        }
    }
}