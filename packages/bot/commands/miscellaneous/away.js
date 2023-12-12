module.exports.props = {
    commandName: "away",
    description: "Let everyone know you're away",
    usage: "/away [time]",
    interaction: {
        type: 1,
        options: [
            {
                name: "time",
                type: 10,
                description: "The amount (in minutes) of time you want to be away for",
                required: true,
                minValues: 5,
                maxValues: 720,
            },
        ],
    }
}

module.exports.run = async (client, interaction) => {

    console.log(interaction)


}