module.exports = async (client, payload) => {

    // Check if all required attributes exist in the payload
    // Else return
    const requiredAttributes = ['guildId', 'userId', 'level'];
    for (const attribute of requiredAttributes) {
        // if (!payload.hasOwnProperty(attribute)) return;
    }


    console.log("guildMemberRank.js: ", payload);

    /** LEVEL ROUTE
     * @one - Add a function that will check the ranks of the guild
     * @two - If the member is higher than the level of a rank, 
     * @three Add this rank to the member && @four Send a RabbitMQ message with
     * @five - (the guildId, userId, level and (highest)rank)
     */

    /** THIS EVENT
     * @one - Get the member_levels and rank-roles from the API
     * @two - Filter all rank-roles with lower level than the member's level
     * @three - Find the member and the roles in the guild
     * @four - Give the member the rank-roles
     */







}