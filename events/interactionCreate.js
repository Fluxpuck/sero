/*  FluxBot © 2023 Fluxpuck
This event is triggers by Discord and does processing of data  */

module.exports = async (client, interaction) => {

    // Check if the interaction is a command
    if (!interaction.isCommand()) return;

    // Find and execute the command
    const commandFile = client.commands.get(interaction.commandName);
    if (commandFile) {

        // Check if the command is private
        const { ownerIds } = require('../config/config.json');
        if (commandFile.private === true && !ownerIds.includes(interaction.user.id)) return interaction.reply({ content: '*This command is private.*', ephemeral: true });

        // Run the command
        commandFile.run(client, interaction).catch((err) => { console.error(err); interaction.reply({ content: '*There was an error while executing this command!*', ephemeral: true }); });

    }

    return;
}