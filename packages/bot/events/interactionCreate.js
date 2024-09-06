const eventEnum = require('../config/eventEnum');

module.exports = async (client, interaction) => {
    // Return if guild is not active!
    if (!interaction.guild.active) return interaction.reply({
        content: `Your guild is not yet active!`,
        ephemeral: true
    });

    try {
        // Check if the interaction has an autocomplete function
        if (interaction.isAutocomplete()) {
            const commandFile = client.commands.get(interaction.commandName);
            if (commandFile) commandFile.autocomplete(client, interaction);
        }

        // Check if the interaction is a button
        if (interaction.isButton()) {
            client.emit(eventEnum.BUTTON_INTERACTION, interaction);
        }

        // Check if the interaction is a command
        if (interaction.isCommand()) {
            const commandFile = client.commands.get(interaction.commandName);
            if (commandFile) {
                // Run the command
                commandFile.run(client, interaction);
            }
        }

    } catch (error) {
        // Handle errors with detailed information
        return console.error(`Error "${interaction.commandName}":`, error);
    }
}