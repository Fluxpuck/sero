module.exports = async (client, payload) => {



    console.log("RabbitMQ message received & event GUILD_MEMBER_RANK emitted", payload);










    // Check if all required attributes exist in the payload
    // Else return
    // const requiredAttributes = ['guildId', 'userId', 'level'];
    // for (const attribute of requiredAttributes) {
    //     // if (!payload.hasOwnProperty(attribute)) return;
    // }

    // console.log("guildMemberRank.js: ", payload);

    /**
     * @TODO - Send message on level.js route when someone reaches a new rank
     * @api - Add a beforeSave hook that will check the (guild)ranks of the user
     * @api - If the member is higher than the level of a (guild)rank, 
     * @api - Add this rank to the member in the database
     * @api - And, sent a RabbitMQ message with (the guildId, userId, level and (highest)rank)
     * 
     * @bot - Get the (highest)rank of the member
     * @bot - Get all (guild)rank roles lower than the member's rank
     * @bot - Find the member and the roles in the guild
     * @bot - Give the member the rank-roles
     */

}