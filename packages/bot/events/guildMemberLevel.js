
module.exports = async (client, message, oldLevel, newLevel) => {
    if (!oldLevel || !newLevel) return;

    /*
    @TODO IS TO GET THE TARGET CHANNEL FROM THE DATABASE? OR JUST REPLY TO THE USER IN THE VC
    */

    const targetChannel = message.guild.channels.cache.get("1181313001232543804");

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