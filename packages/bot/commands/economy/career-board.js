const { getRequest } = require("../../database/connection");
const { ActionRowBuilder, ComponentType, MessageFlags } = require("discord.js");
const { createCustomEmbed } = require("../../assets/embed");
const ClientButtonsEnum = require("../../assets/embed-buttons");
const { chunk } = require("../../lib/helpers/MathHelpers/arrayHelper");
const {
  deferInteraction,
  replyInteraction,
  followUpInteraction,
  updateInteraction,
} = require("../../utils/InteractionManager");

module.exports.props = {
  commandName: "career-board",
  description: "Get the career level leaderboard of the server.",
  usage: "/career",
  interaction: {
    type: 1,
    options: [],
  },
  defaultMemberPermissions: ["SendMessages"],
};

const updateLeaderboardEmbed = (
  interaction,
  leaderboardPages,
  amount,
  page,
  maxpages
) => {
  const header = `Here is the top ${amount} users on the career leaderboard! \n\n`;
  const description =
    amount > 0
      ? leaderboardPages[page].join("\n")
      : "There are currently no users on the leaderboard yet!";
  const footerText =
    maxpages > 0 ? `Leaderboard page ${page + 1} of ${maxpages + 1}` : null;

  return createCustomEmbed({
    title: `Career Leaderboard`,
    description: header + description,
    thumbnail: interaction.guild.iconURL({ dynamic: true }),
    footer: { text: footerText },
  });
};

const updateLeaderboardValues = (leaderboardData) => {
  const leaderboardValues = leaderboardData.map((user, index) => {
    const rankings = ["🥇", "🥈", "🥉"];
    const ranking = rankings[index] || `${index + 1}.`;
    return `**${ranking}** \`${user.userName}\` - lvl ${user.level} | exp ${user.experience}`;
  });

  const leaderboardPages = chunk(leaderboardValues, 10);
  return {
    leaderboardPages: leaderboardPages,
    amount: leaderboardValues.length,
    maxpages: leaderboardPages.length - 1,
  };
};

const updateLeaderboardComponents = (leaderboardPages, page, maxpages) => {
  const paginationButtons =
    leaderboardPages.length > 1
      ? [
          ClientButtonsEnum.PREVIOUS_PAGE.setDisabled(page === 0),
          ClientButtonsEnum.NEXT_PAGE.setDisabled(page === maxpages),
        ]
      : [];

  return paginationButtons.length > 0
    ? new ActionRowBuilder().addComponents(paginationButtons)
    : [];
};

module.exports.run = async (client, interaction, page = 0) => {
  await deferInteraction(interaction, false);

  // Missing Route: API route for career leaderboard needs to be implemented
  const careerResult = await getRequest(
    `/guild/${interaction.guildId}/economy/career/`
  );
  if (careerResult?.status !== 200) {
    return followUpInteraction(interaction, {
      content: `Oops! Something went wrong while trying to fetch the leaderboard!`,
      flags: MessageFlags.Ephemeral,
    });
  }

  const leaderboardData = careerResult?.data ?? [];
  let { leaderboardPages, amount, maxpages } =
    updateLeaderboardValues(leaderboardData);

  let messageEmbed = updateLeaderboardEmbed(
    interaction,
    leaderboardPages,
    amount,
    page,
    maxpages
  );
  let messageComponents = updateLeaderboardComponents(
    leaderboardPages,
    page,
    maxpages
  );

  const response = await replyInteraction(interaction, {
    embeds: [messageEmbed],
    components: messageComponents,
  });

  // Set up collector for button interactions
  const collector = response.createMessageComponentCollector({
    componentType: ComponentType.Button,
    idle: 300_000,
    time: 3_600_000,
  });

  collector.on("collect", async (i) => {
    const selectedButton = i.customId;
    switch (selectedButton) {
      case "previous_pg":
        page = Math.max(0, page - 1);
        break;
      case "next_pg":
        page = Math.min(maxpages, page + 1);
        break;
      default:
        return;
    }

    const updatedEmbed = updateLeaderboardEmbed(
      interaction,
      leaderboardPages,
      amount,
      page,
      maxpages
    );
    const updatedComponents = updateLeaderboardComponents(
      leaderboardPages,
      page,
      maxpages
    );

    await updateInteraction(i, {
      embeds: [updatedEmbed],
      components: [updatedComponents],
    });
  });

  collector.on("end", async (i) => {
    i.components.forEach((button) => button.setDisabled(true));
    await updateInteraction(response, {
      components: [updatedComponents],
    });
  });
};
