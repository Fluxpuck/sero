const { findUser } = require("../lib/resolvers/userResolver");
const { deleteRequest } = require("../database/connection");

module.exports = async (client, payload = []) => {

    // Check if all required attributes exist in the payload
    const requiredAttributes = ['guildId', 'userId', 'roleId'];
    for (const attribute of requiredAttributes) {
        if (!payload.hasOwnProperty(attribute)) return;
    }

    // Get the guild by guildId and the member by userId
    const guild = await client.guilds.fetch(payload.guildId);
    const member = findUser(guild, payload.userId) || await guild.members.fetch(payload.userId);

    try {
        // REMOVE temporary role from the member
        const role = await guild.roles.fetch(payload.roleId);
        if (role) {
            // Remove the role from the member
            await member?.roles?.remove(role, `Remove temporary role`).then(() => {
                // Delete the temp role from the database
                deleteRequest(`/guilds/${payload.guildId}/roles/${payload.userId}/${payload.roleId}`);
            }).catch(err => {
                throw new Error(`Error removing temporary role from ${member.name}`, err);
            });
        }

    } catch (err) {
        console.error(`Error processing role removal: ${err.message}`);
    }
};