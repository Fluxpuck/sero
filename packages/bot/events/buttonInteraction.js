const ButtonInteractions = {
    "logs": require("../commands/moderation/ban"),
    "avatar": require("../commands/miscellaneous/ping")
}

module.exports = async (client, interaction) => {


    console.log("Button Interaction")
    console.log(interaction)

    console.log(interaction.customId)

    const commandFile = ButtonInteractions[interaction.customId];
    console.log(commandFile)

    commandFile.run(client, interaction);


}