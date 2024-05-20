module.exports = async (client, payload = []) => {

    // Check if all required attributes exist in the payload
    const requiredAttributes = ['guildId', 'userId', 'userRanks', 'guildRewards'];
    for (const attribute of requiredAttributes) {
        if (!payload.hasOwnProperty(attribute)) return;
    }

    console.log("guildMemberRank.js: ", payload);

    /**
     * @TODO - GIVE MEMBER ALL THE RANK REWARDS THEY HAVE EARNED
     * 
     * @bot - GET THE GUILD by guildId
     * @bot - GET THE MEMBER by userId
     * 
     * @bot - Create two lists: addRewards & removeRewards
     * @bot - LOOP THROUGH userRanks & removeRewards they no longer deserve
     * @bot - LOOP THROUGH userRanks & addRewards they deserve
     */

}