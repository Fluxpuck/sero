const eventEnum = require('../config/eventEnum');

module.exports = async (client, interaction) => {
    // Return if guild is not active!
    if (!interaction.guild.active) return interaction.reply({
        content: `*This bot has not been activated in this guild yet!*`,
        ephemeral: true,
    });;

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
        console.error(`Error in command execution for "${interaction.commandName}":`, error);

        return interaction.reply({
            content: `*There was an error while executing the command "${interaction.commandName}"*\n${error.message}`,
            ephemeral: true,
        });
    }
}