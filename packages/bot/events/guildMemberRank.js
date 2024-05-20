module.exports = async (client, payload = []) => {

    // Check if all required attributes exist in the payload
    // Else return
    const requiredAttributes = ['guildId', 'userId', 'level', 'rank'];
    for (const attribute of requiredAttributes) {
        if (!payload.hasOwnProperty(attribute)) return;
    }

    console.log("guildMemberRank.js: ", payload);









    /**
     * @TODO - Send message on level.js route when someone reaches a new rank
     * 
     * @bot - Get the (highest)rank of the member
     * @bot - Get all (guild)rank roles lower than the member's rank
     * @bot - Find the member and the roles in the guild
     * @bot - Give the member the rank-roles
     */

}