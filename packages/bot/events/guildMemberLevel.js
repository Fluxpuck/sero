const { getRequest } = require('../database/connection');
const { findUser } = require('../lib/resolvers/userResolver');
const { LEVEL_MESSAGES } = require("../assets/level-messages");

module.exports = async (client, payload = []) => {

    // Check if all required attributes exist in the payload
    const requiredAttributes = ['guildId', 'userId', 'userRankRewards', 'allRankRewards', 'level'];
    for (const attribute of requiredAttributes) {
        if (!payload.hasOwnProperty(attribute)) return;
    }

    // Get the guild by guildId and the member by userId
    const guild = await client.guilds.fetch(payload.guildId);
    const member = findUser(guild, payload.userId) || await guild.members.fetch(payload.userId);
    if (!guild || !member) return;

    // Send a  level up message if the level is greater than 0
    if (payload.level > 0) {
        try {
            // Fetch the welcome channel
            const messageChannel = await getRequest(`/guilds/${payload.guildId}/settings/levelup-channel`);
            if (messageChannel.status === 200) {

                // Get channel from request
                const { targetId } = messageChannel.data
                const channel = await guild.channels.fetch(targetId);
                if (!channel) return;

                // Get a random message
                let idx = Math.floor(Math.random() * LEVEL_MESSAGES.length);
                const levelUpMessage = LEVEL_MESSAGES[idx]
                    .replace('{AUTHOR}', `<@${member.id}>`)
                    .replace('{LEVEL}', `${payload.level}`);


                // Send the welcome message
                channel.send(levelUpMessage);
            }
        } catch (error) {
            console.error('Error sending level up message:', error);
        }
    }



    // Ranks that are unattained by the member
    const unattainedRankRewards = payload.allRankRewards.filter(rank =>
        !payload.userRankRewards.some(userRank => userRank.level === rank.level)
    );

    // REMOVE unattained rank rewards from the member
    for (const rank of unattainedRankRewards) {
        // Get the role by roleId
        const role = await guild.roles.fetch(rank.roleId);
        if (role) {
            // Remove the role from the member
            await member?.roles?.remove(role, `Remove unattained rank reward role for level ${rank.level}`).catch(err => {
                throw new Error(`Error removing unattained rank reward role for level ${rank.level} from ${member.name}`, err);
            });
        }
    }

    // ADD attained rank rewards to the member
    for (const rank of payload.userRankRewards) {
        // Get the role by roleId
        const role = await guild.roles.fetch(rank.roleId);
        if (role) {
            // Add the role to the member
            await member?.roles?.add(role, `Add attained rank reward role for level ${rank.level}`).catch(err => {
                throw new Error(`Error adding attained rank reward role for level ${rank.level} to ${member.name}`, err);
            });
        }
    }


}