const { findUser } = require("../../lib/resolvers/userResolver");

module.exports = async (client, payload = []) => {

    // Check if all required attributes exist in the payload
    const requiredAttributes = ['guildId', 'userId', 'roleId'];
    for (const attribute of requiredAttributes) {
        if (!payload.hasOwnProperty(attribute)) return;
    }

    try {
        // Get the guild by guildId and the member by userId
        const guild = await client.guilds.fetch(payload.guildId);
        const member = findUser(guild, payload.userId);
        const role = await guild.roles.fetch(payload.roleId);

        // Remove the role from the member
        await member?.roles?.remove(role, `Remove temp role ${role.name}`).catch(err => {
            throw new Error(`Error removing temporary role ${role.name} from ${member.name}`, err);
        });

    } catch (err) {
        console.error(err);
    };

};