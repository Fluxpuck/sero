/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    This event is triggers by Discord and does processing of data  */

//require modules
const { getGuildMembersFromBL, deleteMemberFromBL } = require("../database/QueryManager")
const moment = require('moment');

module.exports = async (client) => {
    //go through each guild
    Array.from(client.guilds.cache.values()).forEach(async guild => {

        //get all blocked members per guild
        const guildMembers = await getGuildMembersFromBL(guild.id);

        // → go over all members and check if their expire time 
        for (let member of guildMembers) {
            //get all values from object
            const { userId, expire_time, create_date } = member

            //add expire time (in days) to date
            var expireDate = moment(create_date).add(expire_time, 'd').toDate()
            //calculate difference in days between two dates
            var x = new moment(), y = new moment(expireDate)
            var durationDays = moment.duration(y.diff(x))
            //check if duration is below 0 days
            if (durationDays.asDays() <= 0) {
                //remove from member from application timeout
                await deleteMemberFromBL((guild.id, userId))
            }
        }

        return;
    })
}