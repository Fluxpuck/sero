/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit hyperbot.cc  */

// → Importing necessary modules, functions and classes
const { EmbedBuilder } = require('discord.js');

// → Import styling elements
const colors = require('../../assets/embed-colors.json');

// → Constructing the command and exporting
module.exports.run = async (client, interaction) => {

    // Get all client commands that are not private
    const clientCommands = client.commands.map(c => c.details)
    // .filter(c => !c.private);

    // Sort the commands by folder (category)
    const groupBy = (x, f) => x.reduce((a, b, i, x) => { const k = f(b, i, x); a.get(k)?.push(b) ?? a.set(k, [b]); return a; }, new Map());
    const sortCommands = groupBy(clientCommands, v => v.directory);

    // Setup the embed
    let messageEmbed = new EmbedBuilder()
        .setColor(colors.home)

    // Check if user specified a command
    const commandOptions = interaction.options.get('command');
    if (commandOptions == null) { // No command specified

        // Setup the embed
        messageEmbed
            .setTitle('Flux - Help')
            .setThumbnail(client.user.displayAvatarURL({ dynamic: false }))
            .setDescription('Flux is a Discord bot written in JavaScript using the Discord.js library.');

        // Display the commands by folder (category)
        for (let [key, value] of sortCommands) {
            messageEmbed.addFields(
                { name: capitalize(key), value: `${value.map(c => `- ${c.name}`).join('\n')}`, inline: true }
            )
        }

        // Send the message
        return interaction.reply({
            embeds: [messageEmbed],
            components: [],
            ephemeral: false
        }).catch((err) => { throw err });

    } else { // Command specified

        // Get the command information
        const inputOption = commandOptions.value;
        const commandDetails = client.commands.get(inputOption).details;

        // Setup the embed
        messageEmbed
            .setTitle(`Help - ${capitalize(commandDetails.name)}`)
            .setThumbnail(client.user.displayAvatarURL({ dynamic: false }))
            .setDescription(commandDetails.description)
            .addFields({ name: `Usage`, value: `${commandDetails.usage}`, inline: false },
                { name: `Additional Info`, value: `For more help and resources visit our [website](https://bot.fluxpuck.com)`, inline: false },)

        //reply to message
        return interaction.reply({
            embeds: [messageEmbed],
            ephemeral: false
        }).catch((err) => { throw err });
    }
}


// → Exporting the command details
const path = require('path');
const { capitalize } = require('../../lib/text/text-modifications');
// Load the commands from the config file
try {
    applicationChoices = require('../../assets/help-commands.json');
} catch (error) {
    applicationChoices = []
}


module.exports.details = {
    name: 'help',
    directory: path.relative(path.resolve(__dirname, '..'), __dirname),
    description: 'Show list of commands or information about a specific command',
    usage: '/help [command]',
    private: false,
    cooldown: 0,
    interaction: {
        type: 1, // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandType
        options:
            [
                {
                    name: 'command',
                    type: 3, // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType 
                    description: 'The command to get information about',
                    choices: applicationChoices,
                    required: false
                }
            ],
        permissionType: [],
        optionType: [],
        ephemeral: false,
        modal: false,
        defaultMemberPermissions: []
    }
}