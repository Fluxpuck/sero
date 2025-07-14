const { ActionRowBuilder, ComponentType, MessageFlags } = require("discord.js");
const { createCustomEmbed } = require("../../assets/embed");
const ClientButtonsEnum = require("../../assets/embed-buttons");
const { chunk } = require("../../lib/helpers/MathHelpers/arrayHelper");
const { capitalize } = require("../../lib/helpers/StringHelpers/stringHelper");
const {
  deferInteraction,
  replyInteraction,
  updateInteraction,
  followUpInteraction,
} = require("../../utils/InteractionManager");
const {
  getCachedLeaderboardData,
  invalidateLeaderboardCache,
} = require("../../utils/cache/balance.cache");

module.exports.props = {
  commandName: "balance-board",
  description: "Get the balance leaderboard of the server.",
  usage: "/economy",
  interaction: {
    type: 1,
    options: [],
  },
  defaultMemberPermissions: ["SendMessages"],
};

const fetchLeaderboardData = async (interaction, type = "wallet") => {
  try {
    const data = await getCachedLeaderboardData(interaction.guildId, type);
    if (!data) {
      throw new Error("Failed to fetch leaderboard data");
    }
    return data;
  } catch (error) {
    await followUpInteraction(interaction, {
      content: `Oops! Something went wrong while trying to fetch the leaderboard!`,
      flags: MessageFlags.Ephemeral,
    });
    return [];
  }
};

const updateLeaderboardValues = (leaderboardData, balanceType) => {
  const leaderboardValues = leaderboardData.map((user, index) => {
    const rankings = ["🥇", "🥈", "🥉"];
    const ranking = rankings[index] || `${index + 1}.`;
    const balance = user.balance;
    const icon = balanceType === "wallet" ? "🪙" : "🏦";
    return `**${ranking}** \`${user.userName}\` - ${icon} ${balance}`;
  });

  const leaderboardPages = chunk(leaderboardValues, 10);
  return {
    leaderboardPages,
    amount: leaderboardValues.length,
    maxpages: Math.max(0, leaderboardPages.length - 1),
  };
};

const updateLeaderboardEmbed = (
  interaction,
  leaderboardPages,
  amount,
  page,
  maxpages,
  balanceType
) => {
  const header = `Here is the top ${amount} users on the ${balanceType} leaderboard! \n\n`;
  const description =
    amount > 0 && leaderboardPages[page]
      ? leaderboardPages[page].join("\n")
      : "There are currently no users on the leaderboard yet!";
  const footerText =
    maxpages > 0 ? `Leaderboard page ${page + 1} of ${maxpages + 1}` : null;

  return createCustomEmbed({
    title: `Economy Leaderboard - ${capitalize(balanceType)}`,
    description: header + description,
    thumbnail: interaction.guild.iconURL({ dynamic: true }),
    footer: { text: footerText },
  });
};

const updateLeaderboardComponents = (
  leaderboardPages,
  page,
  maxpages,
  balanceType
) => {
  const paginationButtons =
    leaderboardPages.length > 1
      ? [
          ClientButtonsEnum.PREVIOUS_PAGE.setDisabled(page === 0),
          ClientButtonsEnum.NEXT_PAGE.setDisabled(page === maxpages),
        ]
      : [];

  const balanceButton =
    balanceType === "wallet"
      ? ClientButtonsEnum.BANK
      : ClientButtonsEnum.WALLET;

  return new ActionRowBuilder().addComponents([
    ...paginationButtons,
    balanceButton,
  ]);
};

module.exports.run = async (
  client,
  interaction,
  balanceType = "wallet",
  page = 0
) => {
  await deferInteraction(interaction, false);

  const leaderboardData = await fetchLeaderboardData(interaction, balanceType);
  if (!leaderboardData.length) return;

  let { leaderboardPages, amount, maxpages } = updateLeaderboardValues(
    leaderboardData,
    balanceType
  );

  const messageEmbed = updateLeaderboardEmbed(
    interaction,
    leaderboardPages,
    amount,
    page,
    maxpages,
    balanceType
  );
  const messageComponents = updateLeaderboardComponents(
    leaderboardPages,
    page,
    maxpages,
    balanceType
  );

  const response = await replyInteraction(interaction, {
    embeds: [messageEmbed],
    components: [messageComponents],
  });

  const collector = response.createMessageComponentCollector({
    componentType: ComponentType.Button,
    idle: 300_000,
    time: 600_000, // 10 minutes
  });

  collector.on("collect", async (i) => {
    try {
      const selectedButton = i.customId;

      switch (selectedButton) {
        case "wallet":
        case "bank":
          balanceType = selectedButton;
          page = 0; // Reset page when switching views
          break;
        case "previous_pg":
          page = Math.max(0, page - 1);
          break;
        case "next_pg":
          page = Math.min(maxpages, page + 1);
          break;
        default:
          return;
      }

      // Fetch fresh data on each interaction
      const freshData = await fetchLeaderboardData(interaction, balanceType);
      if (!freshData.length) return;

      const {
        leaderboardPages: updatedPages,
        amount: updatedAmount,
        maxpages: updatedMaxPages,
      } = updateLeaderboardValues(freshData, balanceType);

      const updatedEmbed = updateLeaderboardEmbed(
        interaction,
        updatedPages,
        updatedAmount,
        page,
        updatedMaxPages,
        balanceType
      );
      const updatedComponents = updateLeaderboardComponents(
        updatedPages,
        page,
        updatedMaxPages,
        balanceType
      );

      await updateInteraction(i, {
        embeds: [updatedEmbed],
        components: [updatedComponents],
      });
    } catch (error) {
      console.error("Error handling button interaction:", error);
      await followUpInteraction(interaction, {
        content: "There was an error while updating the leaderboard.",
        flags: MessageFlags.Ephemeral,
      });
    }
  });

  collector.on("end", async (i) => {
    // Invalidate cache when the collector ends
    await invalidateLeaderboardCache(interaction.guildId);

    // TODO: Disable button to prevent confusion
    // Can't figure it out
  });
};
