/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit hyperbot.cc  */

//import styling from assets
const embed = require('../../assets/embed.json');

//load required modules
const { EmbedBuilder } = require('discord.js');
const { capitalize } = require('../../utils/functions');

//construct the command and export
module.exports.run = async (client, interaction) => {

    //fetch all commands 
    const clientCommands = client.commands.map(c => c.info)
        //filter out 'private' and 'test' categories
        .filter(c => c.command.category != 'private' && c.command.category != 'test')

    //setup the embedded message
    const messageEmbed = new EmbedBuilder()
        .setThumbnail(client.user.displayAvatarURL({ dynamic: false }))
        .setColor(embed.color)
    // .setFooter({ text: `${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ dynamic: false }) });

    //check for command options
    const commandOptions = interaction.options.get('command');
    if (commandOptions == null) {

        //general embed description
        messageEmbed
            .setTitle(`${client.user.username} - Commandlist`)
            .setDescription(`Here is a list with all ${clientCommands.length} available commands.\
            \ Use command \`/help [command]\` to get more detailed information.`)

        //sort commands by category
        const groupBy = (x, f) => x.reduce((a, b, i, x) => { const k = f(b, i, x); a.get(k)?.push(b) ?? a.set(k, [b]); return a; }, new Map());
        const sortCommands = groupBy(clientCommands, v => v.command.category);

        //loop through sorted commands
        for (let [key, value] of sortCommands) {
            messageEmbed.addFields(
                {
                    name: `${capitalize(key)}`,
                    value: `
\`\`\`
${value.map(c => c.command.name).join('\n')}
\`\`\`
                        `,
                    inline: true
                }
            )
        }

        //reply to message
        return interaction.editReply({
            embeds: [messageEmbed],
            ephemeral: false
        }).catch((err) => { });

    } else {
        //get command info from user input
        const inputOption = commandOptions.value;
        const commandInfo = client.commands.get(inputOption).info;

        //general embed description
        messageEmbed
            .setTitle(`${capitalize(inputOption)} - Command Information`)
            .addFields(
                { name: `Description`, value: `\`\`\`${commandInfo.command.desc}\`\`\``, inline: false },
                { name: `Usage`, value: `\`\`\`${commandInfo.command.usage}\`\`\``, inline: false },
            )

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
        desc: 'Show all commands, or get more detailed information about a specific command',
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