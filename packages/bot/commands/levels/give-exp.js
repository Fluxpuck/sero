const { postRequest } = require("../../database/connection");

module.exports.props = {
    commandName: "give-exp",
    description: "Give experience to a user",
    usage: "/give-exp [user] [amount]",
    interaction: {
        type: 1,
        options: [
            {
                name: "user",
                type: 6,
                description: "Select a user to give experience to",
                required: true
            },
            {
                name: "amount",
                type: 10,
                description: "The amount of experience to give to the user",
                required: true,
                minValue: 1,
                maxValue: 1000000,
            },
        ],
    }
}

module.exports.run = async (client, interaction) => {




    const result = await postRequest(`/levels/${message.guildId}/${message.author.id}`);




}