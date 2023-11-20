const { EmbedBuilder } = require('discord.js');
const colors = require('../../assets/embed-colors.json');

module.exports.props = {
    commandName: "help",
    description: "Get information on the bot",
    usage: "/help",
    interaction: {
        type: 1, // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandType
        options:
            [
                {
                    name: 'command',
                    type: 3, // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType 
                    description: 'The command to get information about',
                    choices: [],
                    required: false
                }
            ],
    }
}

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