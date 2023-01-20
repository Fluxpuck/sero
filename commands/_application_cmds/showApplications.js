/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit fluxpuck.com  */


// → Assets and configs
const embed = require('../../assets/embed.json');
const { PREVIOUS_button, NEXT_button } = require('../../assets/buttons');

// → Modules, functions and utilities
const { EmbedBuilder, ActionRowBuilder } = require("discord.js");
const { getMemberApplications } = require("../../database/QueryManager");
const { chunk } = require("../../utils/functions");
const moment = require('moment/moment');

//construct the command and export
module.exports.run = async (client, interaction) => {

    //check for selected member
    const selectMember = interaction.options.get('member');
    //fetch member applications
    const memberApplications = await getMemberApplications(interaction.guild.id, selectMember.value);
    if (memberApplications.length <= 0) return interaction.editReply({
        content: `*This user did not apply previously.*`,
        ephemeral: true
    })

    //setup description array
    let descArray = [], page_interaction;

    //go over all applications and push to desc array
    for (let application of memberApplications) {

        //setup date values
        const applicationDate = moment(application.date).format("Do MMM YYYY, HH:mm")

        //create pages
        descArray.push(`
*Applied at ${applicationDate}*

**Age** - ${application.age} years old
**Region** - ${application.region}
**Reason:** \`\`\`${application.reason}\`\`\` \ **Experience:** \`\`\`${application.experience}\`\`\` 
        `)

    }

    //slice desc array into chunks (pages)
    const descPages = chunk(descArray, 1);

    //setup pages & max page length
    let page = 0, maxpages = descPages.length - 1;

    //construct embedded message
    const messageEmbed = new EmbedBuilder()
        .setTitle(`${selectMember.user.username}'s Applications`)
        .setThumbnail(selectMember.user.displayAvatarURL())
        .setColor(embed.light_color)
        .setDescription(descPages[page].join('\n'))

    //if no pages... return message
    if (descPages.length <= 1) return interaction.followUp({
        embeds: [messageEmbed]
    }).catch((err) => { });

    //if page... add pagination
    if (descPages.length >= 2) {

        //setup footer for pages
        messageEmbed.setFooter({ text: `page ${page + 1} of ${descPages.length} - ${selectMember.user.id}` })

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
        const collector = await page_interaction.createMessageComponentCollector({ componentType: 2, time: 100000 })

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
                .setFooter({ text: `page ${page + 1} of ${descPages.length} - ${selectMember.user.id}` })

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
        name: 'show-applications',
        category: 'APPLICATION',
        desc: 'Show all previous application form answers',
        usage: '/show-applications [user]'
    },
    slash: {
        type: 1, //ChatInput 1, User 2, Message 3
        options: [ //type → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType
            {
                name: 'member',
                type: 6,
                description: 'Choose a member to see their previous application answers',
                required: true
            }
        ],
        modal: false,
        permission: [],
        defaultMemberPermissions: ['ManageGuild'],
        ephemeral: false
    }
}