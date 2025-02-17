const { ActionRowBuilder, ComponentType } = require('discord.js');
const { createCustomEmbed } = require('../../assets/embed');
const { createCustomDropdown } = require('../../assets/embed-dropdowns');
const { capitalize } = require('../../lib/helpers/StringHelpers/stringHelper');
const { replyInteraction, updateInteraction } = require('../../utils/InteractionManager');

module.exports.props = {
    commandName: "help",
    description: "Get information on the bot",
    usage: "/help",
    interaction: {},
    defaultMemberPermissions: ['SendMessages'],
}

module.exports.run = async (client, interaction) => {

    // Get all commands that do not have the Private property
    const commandList = client.commands.map(c => c.props)
        .filter(c => c.private != true || c.category != 'private')
    const groupBy = (x, f) => x.reduce((a, b, i, x) => { const k = f(b, i, x); a.get(k)?.push(b) ?? a.set(k, [b]); return a; }, new Map());
    const sortedCommands = groupBy(commandList, props => props.category);

    // Set a category list for the embed message
    const categoryEmbedFields = [...sortedCommands.entries()].map(([key, value]) => ({
        name: capitalize(key),
        value: value.map(c => `\`/${c.commandName}\``).join('\n'),
        inline: true
    }));

    // Build the messageEmbed
    const messageEmbed = createCustomEmbed({
        title: `${client.user.username} | Help`,
        thumbnail: client.user.displayAvatarURL({ dynamic: false }),
        description: "Use the dropdown menu to get information on specific categories.",
        fields: categoryEmbedFields
    });

    // Set a category list for the dropdown
    const categoryListDropdown = [...sortedCommands.entries()].map(([key, value]) => ({
        label: capitalize(key),
        description: `Get more info on commands in ${capitalize(key)}`,
        value: key
    }));

    // Build the dropdownMenu
    const dropdownMenu = createCustomDropdown({
        customId: "help",
        placeholder: "Select a category",
        options: categoryListDropdown
    });

    // Reply to the user
    const embedActionRow = new ActionRowBuilder().addComponents(dropdownMenu)
    const response = await replyInteraction(interaction, {
        embeds: [messageEmbed],
        components: [embedActionRow],
        : false
});

// Collect the dropdownMenu selection
const options = { componentType: ComponentType.StringSelect, idle: 300_000, time: 3_600_000 }
const collector = response.createMessageComponentCollector({ options });
collector.on('collect', async i => {

    const selectedCategory = i.values[0];

    // Filter commands from the selected category
    const selectedCommands = client.commands.map(c => c.props)
        .filter(c => c.private != true && c.category === selectedCategory)
    const commandEmbedFields = selectedCommands.map(command => (
        {
            name: "\u200b",
            value: `**${capitalize(command.commandName)}** - ${command.description} \n Usage: \`${command.usage}\` ${command.cooldown ? `\n Cooldown: \`${command.cooldown} seconds\`` : ""}`,
            inline: false
        }
    ));

    // Update the messageEmbed 
    messageEmbed.data.title = `${client.user.username} | ${capitalize(selectedCategory)}`
    messageEmbed.data.description = null;
    messageEmbed.data.fields = commandEmbedFields;

    // Update the dropdownMenu
    embedActionRow.components[0].options.forEach(option => {
        option.data.default = false;
        if (option.data.value === selectedCategory) {
            option.data.default = true;
        }
    });

    // Update the messageEmbed
    await updateInteraction(i, {
        embeds: [messageEmbed],
        components: [embedActionRow],
    }).catch((error) => { return error; });

});
}