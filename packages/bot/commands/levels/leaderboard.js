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

module.exports.run = async (client, interaction) => {

    // Get all levels for a specific guild from the database
    const result = await getRequest(`/levels/${interaction.guildId}`);

    console.log(result)

    const leaderboard = result.data

    console.log(leaderboard)




    // If status code is 404, return an error
    // if (result.status === 404) {
    //     return interaction.reply({
    //         content: `Uh oh! There are no users on the leaderboard yet!`,
    //         ephemeral: true
    //     })
    // } else if (result.status !== 200) { // If the status code is not 200, return an error that something went wrong
    //     return interaction.reply({
    //         content: "Oops! Something went wrong while trying to fetch the leaderboard!",
    //         ephemeral: true
    //     })
    // }


}