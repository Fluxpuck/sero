const eventEnum = require("../config/eventEnum");
const { postRequest, getRequest } = require("../database/connection");

module.exports = async (client, message) => {
    if (!message.guild.active) return

    // If the message is from a bot, return
    if (message.author.bot) return;

    /**
     * Check if the message author, the User, is is stored
     * If not, check if the User is in the database
     * If not, create the User in the database
     */
    if (!message.author.storage) {

        // Setup the User Storage Object
        let userStorage = {};

        // Get the User from the database
        const getUserResult = await getRequest(`/users/${message.guildId}/${message.author.id}`);

        // If the User is not in the Database, store it
        if (getUserResult.status == 404) {
            const saveUserResult = await postRequest(`/users/${message.guildId}/${message.author.id}`, {
                userName: message.author.username,
            });

            if (saveUserResult.status == 200) {
                userStorage = saveUserResult.data.data;
            };
        }

        if (getUserResult.status == 200) {
            userStorage = getUserResult.data;
        }

        // Add the userStorage to the User object
        if (userStorage) message.author.storage = userStorage;

    } else {

        // Create a cooldownKey based on the userId and guildId
        const cooldownKey = `${message.author.id}_${message.guildId}`;

        /**
         * This code will get a message per 60 seconds cooldown
         * And will add experience to the user's level
         */
        if (client.cooldowns.has(cooldownKey) === false) {

            // Setup variables for guildMemberLevel event
            let oldMember, newMember;

            // Check if user is present in Levels
            const result = await getRequest(`/levels/${message.guildId}/${message.author.id}`);
            if (result) { oldMember = result.data ? result.data[0] : null }

            // If 404 error, create a new entry
            if (result?.status == 404) {
                // Create a new entry in the leaderboard for the user and guild
                const entry = await postRequest(`/levels/${message.guildId}/${message.author.id}`);
                if (entry) { newMember = entry.data ? entry.data.data : null }
            } else {
                // Give the users experience
                const gain = await postRequest(`/levels/gain/${message.guildId}/${message.author.id}`);
                if (gain) { newMember = gain.data ? gain.data.data : null }
            }

            // Trigger guildMemberLevel event
            client.emit(eventEnum.GUILD_MEMBER_LEVEL, message, oldMember, newMember);

            // Add the user to the cooldowns Collection
            return client.cooldowns.set(cooldownKey, message, 1)
        }
    }
}