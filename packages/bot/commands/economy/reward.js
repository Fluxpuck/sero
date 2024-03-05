const { getRequest } = require("../../database/connection");
const { createCustomEmbed } = require("../../assets/embed")
module.exports.props = {
    commandName: "work-reward",
    description: "Get a reward for completing a work-week.",
    usage: "/work-reward",
    interaction: {
        type: 1,
        options: [],
    },
    defaultMemberPermissions: [],
}

module.exports.run = async (client, interaction) => {

    /*
    1. Fetch the user's career snapshots & last career reward
    2. Check if the user has a streak of 5 days & the last career reward was 5+ days ago
        2.1 Create a work_reward_snapshot ? or Update the work_snapshot && route so it can include tracking rewards
    3. If eligible, give the users 3 options
        3.1. Claim a cash bonus
        3.2. Level-up their career
        3.3. Reset career and choose a new job
    */

}
