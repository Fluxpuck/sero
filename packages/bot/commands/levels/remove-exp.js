module.exports.props = {
    commandName: "remove-exp",
    description: "Remove experience from a user",
    usage: "/remove-exp [user] [amount]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                type: 6,
                description: "Select a user to remove experience from",
                required: true
            },
            {
                name: "amount",
                type: 10,
                description: "The amount of experience to remove from the user",
                required: true,
                minValue: 1,
                maxValue: 1000000,
            },
        ],
    }
}

module.exports.run = async (client, interaction) => {







}