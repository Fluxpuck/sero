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
                required: false,
                minValue: 5,
                maxValue: 720,
            },
        ],
    }
}

module.exports.run = async (client, interaction) => {

    // const timeOption = interaction.options.get("time").user;
    // const timeInMilliseconds = timeOptionInMinutes ? timeOptionInMinutes * 60000 : null;


    return interaction.reply({
        content: "SHADE IS A LITTLE BITCH",
        ephemeral: true,
    }).catch((err) => { throw err });



}