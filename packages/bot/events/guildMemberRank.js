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

    // Ranks that are unattained by the member
    const unattainedRankRewards = payload.allRankRewards.filter(rank =>
        !payload.userRankRewards.some(userRank => userRank.level === rank.level)
    );

    try {
        // REMOVE unattained rank rewards from the member
        for (const rank of unattainedRankRewards) {
            // Get the role by roleId
            const role = await guild.roles.fetch(rank.roleId);
            if (role) {
                // Remove the role from the member
                await member?.roles?.remove(role, `Remove unattained rank reward role for level ${rank.level}`).catch(err => { });
            }
        }

        // ADD attained rank rewards to the member
        for (const rank of payload.userRankRewards) {
            // Get the role by roleId
            const role = await guild.roles.fetch(rank.roleId);
            if (role) {
                // Remove the role from the member
                await member?.roles?.add(role, `Add attained rank reward role for level ${rank.level}`).catch(err => { });
            }
        }

    } catch (err) {
        console.error("Error updating member rank rewards:", err);
    };

}