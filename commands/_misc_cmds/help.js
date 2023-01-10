/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit fluxpuck.com  */

// → Assets and configs
const embed = require('../../assets/embed.json');
const { WEB_button, BOT_BUTTON } = require('../../assets/buttons');

// → Modules, functions and utilities
const { EmbedBuilder, ActionRowBuilder } = require('discord.js');
const { capitalize } = require('../../utils/functions');

//construct the command and export
module.exports.run = async (client, interaction) => {

    //fetch all commands 
    const clientCommands = client.commands.map(c => c.info)
        //filter out 'private' and 'test' categories
        .filter(c => c.command.category != 'private' && c.command.category != 'test')

    //setup the embedded message
    const messageEmbed = new EmbedBuilder()
        .setColor(embed.light_color)

    //check for command options
    const commandOptions = interaction.options.get('command');
    if (commandOptions == null) {

        //general embed description
        messageEmbed
            .setTitle(`Help`)
            .setDescription(`Hey, this is **${client.user.username}** bot, here to make it easy for you to *create* and *use* __custom commands__ in your server.
            \nA list of all ${clientCommands.length} commands is below, use \`/help [command]\` to get more detailed information on a command.
            \nIf you need any further help, please watch one of our turorials on [https://fluxpuck.com/tutorials](https://fluxpuck.com/tutorials.html)`)

        //sort commands by category
        const groupBy = (x, f) => x.reduce((a, b, i, x) => { const k = f(b, i, x); a.get(k)?.push(b) ?? a.set(k, [b]); return a; }, new Map());
        const sortCommands = groupBy(clientCommands, v => v.command.category);

        //loop through sorted commands
        for (let [key, value] of sortCommands) {
            messageEmbed.addFields(
                {
                    name: `${capitalize(key)}`,
                    value: `
${value.map(c => `\`/${c.command.name}\``).join('\n')}
                        `,
                    inline: true
                }
            )
        }

        //construct website button
        const web_buttons = new ActionRowBuilder()
            .addComponents(WEB_button, BOT_BUTTON);

        //reply to message
        return interaction.editReply({
            embeds: [messageEmbed],
            components: [web_buttons],
            ephemeral: false
        }).catch((err) => { });

    } else {
        //get command info from user input
        const inputOption = commandOptions.value;
        const commandInfo = client.commands.get(inputOption).info;

        //general embed description
        messageEmbed
            .setTitle(`Help → ${commandInfo.command.name}`)
            .setDescription(`
**Desc**        - ${commandInfo.command.desc}
**Usage**       - \`${commandInfo.command.usage}\`
**Link**        - [${commandInfo.command.name}](https://fluxpuck.com/commands#${commandInfo.command.name})`)

        //reply to message
        return interaction.editReply({
            embeds: [messageEmbed],
            ephemeral: false
        }).catch((err) => { });

    }

}

//import command options from json
const applicationChoices = require('../../config/commands.json');

//command information
module.exports.info = {
    command: {
        name: 'help',
        category: 'misc',
        desc: 'Get a list of all available commands',
        usage: '/help [command]'
    },
    slash: {
        type: 1, //ChatInput 1, User 2, Message 3
        options: [ //type: Subcommand 1, SubcommandGroup 2, String 3, Integer 4, Boolean 5, User 6, Channel 7, Role 8, Mentionable 9, Number 10, Attachment 11
            {
                name: 'command',
                type: 3,
                description: 'Choose the command you want extra information about',
                choices: applicationChoices,
                required: false
            },
        ],
        modal: false,
        permission: [],
        defaultMemberPermissions: ['KickMembers'],
        ephemeral: false
    }
}