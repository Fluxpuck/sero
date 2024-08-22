const { getRequest } = require('../../database/connection')
const { ActionRowBuilder, ComponentType } = require("discord.js");
const { createCustomEmbed } = require("../../assets/embed")
const ClientButtonsEnum = require("../../assets/embed-buttons");
const { chunk } = require("../../lib/helpers/MathHelpers/arrayHelper");
module.exports.props = {
    commandName: "career-board",
    description: "Get the career level leaderboard of the server.",
    usage: "/economy",
    interaction: {},
    defaultMemberPermissions: ['SendMessages'],
}

module.exports.run = async (client, interaction, leaderboard = []) => {
    await interaction.deferReply({ ephemeral: false });

    // Fetch all careers.
    const result = await getRequest(`/guilds/${interaction.guildId}/economy/career/`);
    if (result?.status === 200) {
        leaderboard = result.data;
    }

    // If status code is 404, return an error
    if (result?.status === 404) {
        await interaction.deleteReply();
        return interaction.followUp({
            content: `Oops! There is no one on the \`\`career\`\` leaderboard yet!`,
            ephemeral: true
        })
    } else if (result?.status !== 200) {
        await interaction.deleteReply();
        return interaction.followUp({
            content: `Oops! Something went wrong while trying to fetch the leaderboard!`,
            ephemeral: true
        })
    }

    // Setup embed description
    const leaderboardValues = leaderboard.map((career, index) => {
        const user = career.user;

        // Setup the Ranking
        const rankings = ["🥇", "🥈", "🥉"];
        let ranking = rankings[index] || `${index + 1}.`;

        // Construct the leaderboard fields
        const leaderboardTitle = `${ranking} \`${user.userName}\``
        const leaderboardValue = `Level ${career.level}`
        return {
            name: leaderboardTitle,
            value: leaderboardValue,
            inline: false
        }
    });

    // Slice the leaderboard in chunks of 10
    const leaderboardPages = chunk(leaderboardValues, 10)
    let page = 0, maxpages = leaderboardPages.length - 1;

    // Check if there are more than 3 logs
    const hasLeaderboard = leaderboard.length > 0;

    // Construct message Embed
    const messageEmbed = createCustomEmbed({
        title: "Leaderboard",
        description: `${hasLeaderboard ? `Here are the top ${leaderboardValues.length} users on the leaderboard!` : "Uh oh! There are no users on the leaderboard yet!"}`,
        fields: [...(leaderboardPages.length > 0 ? leaderboardPages[page] : [])],
        thumbnail: interaction.guild.iconURL({ dynamic: true }),
    });

    // Construct Pagination Buttons
    const paginationButtons = leaderboardPages.length > 1 ? [ClientButtonsEnum.PREVIOUS_PAGE, ClientButtonsEnum.NEXT_PAGE] : [];
    const messageComponents = paginationButtons.length > 0 ? new ActionRowBuilder().addComponents(...paginationButtons) : null;


    // Double check to set the pagination buttons buttons to their default state...
    const previousIndex = messageComponents?.components?.findIndex(button => button.data.custom_id === "previous_pg");
    const nextIndex = messageComponents?.components?.findIndex(button => button.data.custom_id === "next_pg");
    messageComponents?.components[previousIndex]?.data && (messageComponents.components[previousIndex].data.disabled = true);
    messageComponents?.components[nextIndex]?.data && (messageComponents.components[nextIndex].data.disabled = false);

    // Return the message
    const response = await interaction.editReply({
        embeds: [messageEmbed],
        components: messageComponents ? [messageComponents] : [],
        ephemeral: false
    });

    // Collect the button selection
    const options = { componentType: ComponentType.Button, idle: 300_000, time: 3_600_000 }
    const collector = response.createMessageComponentCollector({ options });
    collector.on('collect', async i => {

        const selectedButton = i.customId;

        /**
         * @selectedButton - Pagination
         * Scroll through the log pages
         */
        if (selectedButton === "previous_pg" || selectedButton === "next_pg") {

            // Update the page number based on the button pressed
            if (selectedButton == 'previous_pg') (page <= 0) ? 0 : page--
            if (selectedButton == 'next_pg') (page >= maxpages) ? maxpages : page++

            // Update the button status, based on the page number
            const previousIndex = messageComponents.components.findIndex(button => button.data.custom_id === "previous_pg");
            const nextIndex = messageComponents.components.findIndex(button => button.data.custom_id === "next_pg");
            switch (page) {
                case 0:
                    messageComponents.components[nextIndex].data.disabled = false;
                    messageComponents.components[previousIndex].data.disabled = true;
                    break;
                case maxpages:
                    messageComponents.components[nextIndex].data.disabled = true;
                    messageComponents.components[previousIndex].data.disabled = false;
                    break;
                default:
                    messageComponents.components[nextIndex].data.disabled = false;
                    messageComponents.components[previousIndex].data.disabled = false;
            }

            // Update embed Footer && Fields
            messageEmbed.setFooter({ text: `Leaderboard page ${page + 1} of ${maxpages + 1}` });
            messageEmbed.data.fields = []; // Empty current fields
            messageEmbed.setFields([...leaderboardPages[page]]);

            // Update the interaction components
            await i.update({
                embeds: [messageEmbed],
                components: [messageComponents]
            })

        }
    })
}