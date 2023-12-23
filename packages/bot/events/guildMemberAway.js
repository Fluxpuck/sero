const { getRequest } = require("../database/connection");

module.exports = async (client, message) => {

    /**
     * Check if the message is mentioning someone
     * If it is mentioning someone, check if the mentioned user is away
     */
    const messageMention = message.mentions.users.first();
    if (messageMention) {
        // Check if the mentioned user is away
        const awayResult = await getRequest(`/away/${message.guildId}/${messageMention.id}`);
        if (awayResult.status == 200) {


            console.log("This member is away!")


        }
        return
    } else {


        // Get the away status of the author
        const awayResult = await getRequest(`/away/${message.guildId}/${message.author.id}`);
        if (awayResult.status == 200) {
            // Trigger guildMemberLevel event
            client.emit(eventEnum.GUILD_MEMBER_LEVEL, message, oldMember, newMember);
        }

    }


    /* 
    Check if there is a mention in the message
    If there is, check if the mentioned user is away
    Else, check if the author is away
    If the user was away, remove the away status
    */









    console.log(awayResult)





}