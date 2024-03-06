module.exports.props = {
    commandName: "career",
    description: "Get information on the balance and career of a user.",
    usage: "/career [user]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                type: 6,
                description: "Select a user to get th balance of",
                required: false
            }
        ],
    },
    defaultMemberPermissions: ['SendMessages'],
}

module.exports.run = async (client, interaction) => {

    /*
    1. Fetch the user's career, job, career snapshots and balance
    2. Create an embed with the user's career featuring:
        - job
        - career level
        - total job earnings
        - total balance
    */

}
