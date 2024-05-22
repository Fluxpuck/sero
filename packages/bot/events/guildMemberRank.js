const { findUser } = require("../lib/resolvers/userResolver");

module.exports = async (client, payload = []) => {

    // Check if all required attributes exist in the payload
    const requiredAttributes = ['guildId', 'userId', 'userRankRewards', 'allRankRewards'];
    for (const attribute of requiredAttributes) {
        if (!payload.hasOwnProperty(attribute)) return;
    }

    // Get the guild by guildId and the member by userId
    const guild = await client.guilds.fetch(payload.guildId);
    const member = findUser(guild, payload.userId);



    console.log("userRankRewards", payload.userRankRewards)
    console.log("allRankRewards", payload.allRankRewards);



    /**
     * @TODO - GIVE MEMBER ALL THE RANK REWARDS THEY HAVE EARNED
     * 
     * @bot - Create two lists: addRewards & removeRewards
     * @bot - LOOP THROUGH userRanks & removeRewards they no longer deserve
     * @bot - LOOP THROUGH userRanks & addRewards they deserve
     */

}