const eventEnum = require("../config/eventEnum");
const { postRequest, getRequest } = require("../database/connection");

module.exports = async (client, message) => {
    if (!message.guild.active) return

    // If the message is from a bot, return
    if (message.author.bot) return;

    /**
     * Check if User has been flagged
     * If not, create/update User in the database
     */
    if (!message.author?.userHash) {
        // Get User from database
        const result = await getRequest(`/users/${message.guildId}/${message.author.id}`);
        // If User is not in the Database, store it
        if (result.status == 404) {
            await postRequest(`/users/${message.guildId}/${message.author.id}`, {
                userName: message.author.username,
            });
        }

        // Add the userHash to the User object
        message.author.userHash = result.data[0]?.userHash

    } else {

        // Store the messageId and channelId
        await postRequest(`/messages/${message.guildId}/${message.author.id}`, {
            messageId: message.id,
            channelId: message.channelId
        });

        /**
         * This code will get a message per 60 seconds cooldown
         * And will add experience to the user's level
         */
        const cooldownKey = message.author.userHash
        if (client.cooldowns.has(cooldownKey) === false) {

            // Setup variables for guildMemberLevel event
            let oldMember, newMember;

            // Check if user is present in Levels
            const result = await getRequest(`/leaderboard/${message.guildId}/${message.author.id}`);
            if (result) { oldMember = result.data ? result.data[0] : null }


            // If 404 error, create a new entry
            if (result.status == 404) {
                // Create a new entry in the leaderboard for the user and guild
                const entry = await postRequest(`/leaderboard/${message.guildId}/${message.author.id}`);
                if (entry) { newMember = entry.data ? entry.data.data : null }
            } else {
                // Give the users experience
                const gain = await postRequest(`/leaderboard/gain/${message.guildId}/${message.author.id}`);
                if (gain) { newMember = gain.data ? gain.data.data : null }
            }

            // Trigger guildMemberLevel event
            client.emit(eventEnum.GUILD_MEMBER_LEVEL, message, oldMember, newMember);

            // Add the user to the cooldowns Collection
            client.cooldowns.set(cooldownKey, message, 60)
        }

    }

    return;
}