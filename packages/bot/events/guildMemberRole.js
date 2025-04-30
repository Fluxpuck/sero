const { findUser } = require("../lib/resolvers/userResolver");
const { deleteRequest } = require("../database/connection");

module.exports = async (client, payload = []) => {

    // Check if all required attributes exist in the payload
    const requiredAttributes = ['guildId', 'userId', 'roleId'];
    for (const attribute of requiredAttributes) {
        if (!payload.hasOwnProperty(attribute)) return;
    }

    try {
        // Get the guild by guildId
        const guild = await client.guilds.fetch(payload.guildId);

        // Try to find the member, but handle the case where they might not be in the server anymore
        let member;
        try {
            member = findUser(guild, payload.userId) || await guild.members.fetch(payload.userId);
        } catch (memberError) {
            // If member is not found, just clean up the database entry and exit
            if (memberError.code === 10007) { // Unknown Member
                console.log(`Member ${payload.userId} no longer in guild ${payload.guildId}, cleaning up database entry`);
                await deleteRequest(`/guilds/${payload.guildId}/roles/${payload.userId}/${payload.roleId}`);
                return;
            }
            throw memberError; // Re-throw if it's a different error
        }

        if (!member) {
            // If member is null but no error was thrown, clean up and exit
            await deleteRequest(`/guilds/${payload.guildId}/roles/${payload.userId}/${payload.roleId}`);
            return;
        }

        // REMOVE temporary role from the member
        const role = await guild.roles.fetch(payload.roleId);
        if (role) {
            // Remove the role from the member
            await member.roles.remove(role, `Remove temporary role`);
            // Delete the temp role from the database
            await deleteRequest(`/guilds/${payload.guildId}/roles/${payload.userId}/${payload.roleId}`);
        } else {
            // If role doesn't exist anymore, just clean up the database
            await deleteRequest(`/guilds/${payload.guildId}/roles/${payload.userId}/${payload.roleId}`);
        }
    } catch (err) {
        console.error(`Error processing role removal: ${err.message}`);
        // Still try to clean up the database entry if there's an error
        try {
            await deleteRequest(`/guilds/${payload.guildId}/roles/${payload.userId}/${payload.roleId}`);
        } catch (dbError) {
            console.error(`Failed to clean up database entry: ${dbError.message}`);
        }
    }
};