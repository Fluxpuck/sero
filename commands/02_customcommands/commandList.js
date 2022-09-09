/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit hyperbot.cc  */

//import styling from assets
const embed = require('../../assets/embed.json');
const { PREVIOUS_button, NEXT_button } = require('../../assets/buttons');

//require modules
const { EmbedBuilder, ActionRowBuilder, InteractionCollector } = require("discord.js");
const { getCustomCommands } = require("../../database/QueryManager");
const { chunk } = require("../../utils/functions");

//construct the command and export
module.exports.run = async (client, interaction) => {

    //get custom commands from database
    const customCommands = await getCustomCommands(interaction.guild);

    //setup description array
    let descArray = [], page_interaction;

    //go over all command and push to desc array
    for await (let command of customCommands) {
        descArray.push(`\`/${interaction.guild.prefix}${command.commandName}\` → ${command.commandResponse}`)
    }

    //slice desc array into chunks (pages)
    const descPages = chunk(descArray, 10);

    //setup pages & max page length
    let page = 0, maxpages = descPages.length - 1;

    //construct embedded message
    const messageEmbed = new EmbedBuilder()
        .setTitle(`Custom Commands`)
        .setColor(embed.light_color)
        .setDescription(descPages[page].join('\n'))

    //if no pages... return message
    if (descPages.length <= 1) return interaction.followUp({
        embeds: [messageEmbed]
    }).catch((err) => { });

    //if page... add pagination
    if (descPages.length >= 2) {

        //setup footer for pages
        messageEmbed.setFooter({ text: `page ${page + 1} of ${descPages.length}` })

        //construct page buttons
        const page_buttons = new ActionRowBuilder()
            .addComponents(PREVIOUS_button, NEXT_button);

        //reset button values...
        page_buttons.components[0].setDisabled(true);
        page_buttons.components[1].setDisabled(false);

        //send interaction
        page_interaction = await interaction.followUp({
            embeds: [messageEmbed],
            components: [page_buttons]
        }).catch((err) => { });

        //start collecting button presses for paginator
        let collector = await new InteractionCollector(client, { message: page_interaction, componentType: 2, time: 120000 }) //ActionRow 1, Button 2, SelectMenu 3, TextInput 4
            .catch((err) => { });

        //collect button interactions
        collector.on('collect', async (button) => {

            //update defer
            await button.deferUpdate();

            //add or retract page
            if (button.customId == 'plus') (page >= maxpages) ? maxpages : page++
            if (button.customId == 'minus') (page <= 0) ? 0 : page--

            //update message description
            messageEmbed
                .setDescription(descPages[page].join('\n'))
                .setFooter({ text: `page ${page + 1} of ${descPages.length}` })

            //check page and alter buttons
            switch (page) {
                case 0:
                    page_buttons.components[0].setDisabled(true)
                    page_buttons.components[1].setDisabled(false)
                    break;
                case maxpages:
                    page_buttons.components[0].setDisabled(false)
                    page_buttons.components[1].setDisabled(true)
                    break;
                default:
                    page_buttons.components[0].setDisabled(false)
                    page_buttons.components[1].setDisabled(false)
            }

            //update the message
            page_interaction.edit({
                embeds: [messageEmbed],
                components: [page_buttons]
            });

        })

        //when button collection is over, disable buttons
        collector.on('end', collected => {

            //disable both buttons
            page_buttons.components[0].setDisabled(true)
            page_buttons.components[1].setDisabled(true)

            //update the message
            page_interaction.edit({
                embeds: [messageEmbed],
                components: [page_buttons]
            });

        })

    }
}

//command information
module.exports.info = {
    command: {
        name: 'commandlist',
        category: 'Custom Commands',
        desc: 'Shows a list with all custom commands',
        usage: '/commandlist'
    },
    slash: {
        type: 1, //ChatInput 1, User 2, Message 3
        options: [], //type: Subcommand 1, SubcommandGroup 2, String 3, Integer 4, Boolean 5, User 6, Channel 7, Role 8, Mentionable 9, Number 10, Attachment 11
        modal: false,
        permission: [],
        defaultMemberPermissions: ['ManageGuild'],
        ephemeral: false
    }
}