const { postRequest } = require('../database/connection');

module.exports = async (client, guild) => {

    const result = await postRequest(`/guilds/${guild.id}`, {
        guild: {
            guildId: guild.id,
            guildName: guild.name,
        }
    })

    if (result.status === 200) {
        const guildOwner = await guild.members.fetch(guild.ownerId).catch(() => null);
        const guildOwnerTag = `${guildOwner && guildOwner.user.tag} (${guild.ownerId})`;

        console.log(`[GUILD CREATE]: ${guild.name} (${guild.id}) from ${guildOwnerTag} - ${guild.memberCount} members`);
    }

}