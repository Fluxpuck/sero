const { getRequest } = require('../../database/connection');
const { ActionRowBuilder, ComponentType, MessageFlags } = require("discord.js");
const { createCustomEmbed } = require("../../assets/embed");
const ClientButtonsEnum = require("../../assets/embed-buttons");
const { chunk } = require("../../lib/helpers/MathHelpers/arrayHelper");
const { capitalize } = require('../../lib/helpers/StringHelpers/stringHelper');
const { deferInteraction, replyInteraction, updateInteraction, followUpInteraction } = require('../../utils/InteractionManager');

module.exports.props = {
    commandName: "balance-board",
    description: "Get the balance leaderboard of the server.",
    usage: "/economy",
    interaction: {
        type: 1,
        options: [],
    },
    defaultMemberPermissions: ['SendMessages'],
}

const updateLeaderboardValues = (leaderboardData, balanceType) => {
    const sortedData = [...leaderboardData].sort((a, b) => {
        const balanceA = balanceType === "wallet" ? a.wallet_balance : a.bank_balance;
        const balanceB = balanceType === "wallet" ? b.wallet_balance : b.bank_balance;
        return balanceB - balanceA;
    });

    const leaderboardValues = sortedData.map((user, index) => {
        const rankings = ["🥇", "🥈", "🥉"];
        const ranking = rankings[index] || `${index + 1}.`;
        const balance = balanceType === "wallet" ? user.wallet_balance : user.bank_balance;
        const icon = balanceType === "wallet" ? "🪙" : "🏦";
        return `**${ranking}** \`${user.userName}\` - ${icon} ${balance}`;
    });

    const leaderboardPages = chunk(leaderboardValues, 10);

    return { leaderboardPages: leaderboardPages, amount: leaderboardValues.length, maxpages: leaderboardPages.length - 1 };
};

const updateLeaderboardEmbed = (interaction, leaderboardPages, amount, page, maxpages, balanceType) => {
    const header = `Here is the top ${amount} users on the  ${balanceType} leaderboard! \n\n`;
    const description = amount > 0 ? leaderboardPages[page].join("\n") : "There are currently no users on the leaderboard yet!";
    const footerText = maxpages > 0 ? `Leaderboard page ${page + 1} of ${maxpages + 1}` : null;

    return createCustomEmbed({
        title: `Economy Leaderboard - ${capitalize(balanceType)}`,
        description: header + description,
        thumbnail: interaction.guild.iconURL({ dynamic: true }),
        footer: { text: footerText }
    });
};

const updateLeaderboardComponents = (leaderboardPages, page, maxpages, balanceType) => {
    const paginationButtons = leaderboardPages.length > 1 ? [
        ClientButtonsEnum.PREVIOUS_PAGE.setDisabled(page === 0),
        ClientButtonsEnum.NEXT_PAGE.setDisabled(page === maxpages)
    ] : [];

    const balanceButton = balanceType === 'wallet' ? ClientButtonsEnum.BANK : ClientButtonsEnum.WALLET;

    const messageComponents = new ActionRowBuilder().addComponents(
        [...paginationButtons, balanceButton]
    );

    return messageComponents;
};

module.exports.run = async (client, interaction, balanceType = "wallet", page = 0) => {
    await deferInteraction(interaction, false);

    const balanceResult = await getRequest(`/guilds/${interaction.guildId}/economy/balance?limit=100`);
    if (balanceResult?.status !== 200) {
        return followUpInteraction(interaction, {
            content: `Oops! Something went wrong while trying to fetch the leaderboard!`,
            flags: MessageFlags.Ephemeral
        });
    }

    const leaderboardData = balanceResult?.data ?? [];
    let { leaderboardPages, amount, maxpages } = updateLeaderboardValues(leaderboardData, balanceType);

    let messageEmbed = updateLeaderboardEmbed(interaction, leaderboardPages, amount, page, maxpages, balanceType);
    let messageComponents = updateLeaderboardComponents(leaderboardPages, page, maxpages, balanceType);

    const response = await replyInteraction(interaction, {
        embeds: [messageEmbed],
        components: [messageComponents],

    });

    const collector = response.createMessageComponentCollector({
        componentType: ComponentType.Button,
        idle: 300_000,
        time: 3_600_000
    });

    collector.on('collect', async i => {
        let { leaderboardPages, amount, maxpages: newMaxPages } = updateLeaderboardValues(leaderboardData, balanceType);
        const selectedButton = i.customId;

        switch (selectedButton) {
            case 'wallet':
                balanceType = "wallet";
                break;
            case 'bank':
                balanceType = "bank";
                break;
            case 'previous_pg':
                page = Math.max(0, page - 1);
                break;
            case 'next_pg':
                page = Math.min(newMaxPages, page + 1);
                break;
            default:
                return;
        }

        const updatedEmbed = updateLeaderboardEmbed(interaction, leaderboardPages, amount, page, newMaxPages, balanceType);
        const updatedComponents = updateLeaderboardComponents(leaderboardPages, page, newMaxPages, balanceType);

        await updateInteraction(i, {
            embeds: [updatedEmbed],
            components: [updatedComponents]
        });
    });

    collector.on('end', async i => {
        if (i.components) {
            const disabledComponents = new ActionRowBuilder().addComponents(
                messageComponents.components[0].components.map(button => button.setDisabled(true))
            );
            await updateInteraction(response, {
                components: [disabledComponents]
            });
        }
    });
}