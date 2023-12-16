const { LEVEL_MESSAGES } = require("../assets/level-messages");

module.exports = async (client, message, oldLevel, newLevel) => {
    if (!oldLevel || !newLevel) return;

    /**
     * @TODO Get Channel from the Database
     * Else reply to the message channel
     */
    const targetChannel = message.channel;

    /**
     *  If the new level is higher than the old level, then the user has leveled up 
     *  Reply to the user with a message that they have leveled up
     */
    if (newLevel.level > oldLevel.level) {

        // Get a random message
        let idx = Math.floor(Math.random() * LEVEL_MESSAGES.length);
        const levelUpMessage = LEVEL_MESSAGES[idx].replace('{AUTHOR}', `<@${message.author.id}>`).replace('{LEVEL}', `${newLevel.level}`)

        // Return the message
        return targetChannel.send(levelUpMessage)
            .catch(console.error);

    }

    console.log(newLevel)


}