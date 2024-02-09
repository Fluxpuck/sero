const { getRequest } = require("../../database/connection");

module.exports.props = {
    commandName: "leaderboard",
    description: "Check the leaderboard for the guild",
    usage: "/leaderboard",
    interaction: {
        type: 1,
        options: [],
    },
    defaultMemberPermissions: [],
}

module.exports.run = async (client, interaction, leaderboard = []) => {

    // Get all levels for a specific guild from the database
    const result = await getRequest(`/levels/${interaction.guildId}`);
    if (result.status === 200) {
        leaderboard = result.data
    }

    // If status code is 404, return an error
    if (result.status === 404) {
        return interaction.reply({
            content: `Uh oh! There are no users on the leaderboard yet!`,
            ephemeral: true
        })
    } else if (result.status !== 200) { // If the status code is not 200, return an error that something went wrong
        return interaction.reply({
            content: "Oops! Something went wrong while trying to fetch the leaderboard!",
            ephemeral: true
        })
    }

    // Sort the leaderboard by level
    const sortedLeaderboard = leaderboard.sort((a, b) => b.level - a.level);

    const leaderboardValues = sortedLeaderboard.map((user, index) => {
        return `${index + 1}. <@${user.userId}> - Level ${user.level} - ${user.xp} XP`
    });







}