module.exports = async (client, interaction) => {
    try {
        // Check if the interaction is a command
        if (!interaction.isCommand()) return;

        // Find and execute the command
        const commandFile = client.commands.get(interaction.commandName);
        if (commandFile) {

            // Check if the command is private
            const { ownerIds } = require('../config/config.json');
            if (commandFile.private === true && !ownerIds.includes(interaction.user.id)) return interaction.reply({ content: '*This command is private.*', ephemeral: true });

            // Run the command
            commandFile.run(client, interaction);

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