/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    This event is triggers by Discord and does processing of data  */

module.exports = async (client, interaction) => {

    //check if interaction is application command
    if (!interaction.isCommand()) return;

    //fetch and execute client command
    const commandFile = client.commands.get(interaction.commandName);
    if (commandFile) {
        //check if slash commands hold a modal and skip defer
        if (commandFile.info.slash.modal == false) {
            // check if command is emphemeral or not
            if (commandFile.info.slash.ephemeral == true) await interaction.deferReply({ ephemeral: true }).catch((err) => { });
            if (commandFile.info.slash.ephemeral == false) await interaction.deferReply({ ephemeral: false }).catch((err) => { });
        }
        commandFile.run(client, interaction).catch((err) => { });
    } else {
        //fire custom command event
        await interaction.deferReply({ ephemeral: false }).catch((err) => { });
        client.emit('customCommand', interaction);
    }

    return;
}