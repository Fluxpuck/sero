const { getRequest, postRequest } = require("../../database/connection");
const { last } = require("lodash");

module.exports = {

    /**
     * Fetches the user's career job options from the API
     * @param {string} guildId - The guild ID
     * @param {string} userId - The user ID
     */
    async getUserCareerJobOptions(guildId, userId, force = false) {
        try {
            const userJobOptions = await getRequest(`/guilds/${guildId}/activities/user/${userId}/job-options`);
            if (force === false && userJobOptions.status === 200) {
                const activities = last(userJobOptions.data);
                return activities?.additional?.jobs ?? false;
            }
            if (force === true || userJobOptions.status === 404) {
                const clientJobOptions = await getRequest(`/client/jobs?limit=3`);
                if (clientJobOptions.status === 200) {
                    await postRequest(`/guilds/${guildId}/activities`, {
                        userId: userId,
                        type: 'job-options',
                        additional: { jobs: clientJobOptions.data }
                    });

                    return clientJobOptions.data ?? false;
                }
            }

            return false;
        } catch (error) {
            console.error('Error fetching user career job options:', error);
            return false;
        }
    }
};