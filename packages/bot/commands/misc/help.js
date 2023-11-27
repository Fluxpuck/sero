const { EmbedBuilder } = require('discord.js');
const EmbedColors = require('../../assets/embed-colors');
const { capitalize } = require('../../lib/text/text-modifications');
const { createCustomEmbed } = require('../../assets/embed');

module.exports.props = {
    commandName: "help",
    description: "Get information on the bot",
    usage: "/help",
    interaction: {}
}

module.exports.run = async (client, interaction) => {

    // Get all commands that do not have the Private property
    const commandList = client.commands.map(c => c.props)
        .filter(c => c.private != true || c.category != 'private')

    const groupBy = (x, f) => x.reduce((a, b, i, x) => { const k = f(b, i, x); a.get(k)?.push(b) ?? a.set(k, [b]); return a; }, new Map());
    const sortedCommands = groupBy(commandList, props => props.category);

    const categoryList = [...sortedCommands.entries()].map(([key, value]) => ({
        name: capitalize(key),
        value: value.map(c => `\`/${c.commandName}\``).join('\n'),
        inline: true
    }));

    // Build the messageEmbed
    const messageEmbed = createCustomEmbed({
        title: `${client.user.username} | Help`,
        thumbnail: client.user.displayAvatarURL({ dynamic: false }),
        description: "Use the dropdown menu to get information on specific commands.",
        fields: categoryList
    });

    return interaction.reply({
        embeds: [messageEmbed],
        components: [],
        ephemeral: false
    }).catch((error) => { return error; });
}