
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

        const levelUpMessage = `Congratulations <@${message.author.id}>! You have leveled up to level ${newLevel.level}!`;
        return targetChannel.send(levelUpMessage)
            .catch(console.error);

    }


}