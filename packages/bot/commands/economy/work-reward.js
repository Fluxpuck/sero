const { MessageFlags } = require("discord.js");
const { getRequest, postRequest } = require("../../database/connection");
const { createCustomEmbed } = require("../../assets/embed");
const {
  getTimeUntil,
} = require("../../lib/helpers/TimeDateHelpers/timeHelper");
const { getReward } = require("../../lib/helpers/EconomyHelpers/economyHelper");
const {
  deferInteraction,
  followUpInteraction,
  replyInteraction,
} = require("../../utils/InteractionManager");

const BASE_REWARD_EXPERIENCE = 1000;

module.exports.props = {
  commandName: "work-reward",
  description: "Get a reward for completing a work-week.",
  usage: "/work-reward",
  interaction: {
    type: 1,
    options: [],
  },
  defaultMemberPermissions: ["SendMessages"],
};

module.exports.run = async (client, interaction) => {
  await deferInteraction(interaction, false);

  // Check if the user has already claimed their daily work reward
  // Missing Route: API route for fetching user career needs to be implemented
  const userCareer = await getRequest(
    `/guild/${interaction.guildId}/economy/career/${interaction.user.id}`
  );
  if (userCareer.status !== 200) {
    return followUpInteraction(interaction, {
      content:
        "Oh no! You do not have a career yet. Use `/work` to select a job and start working.",
      flags: MessageFlags.Ephemeral,
    });
  }

  // Check if the user has already claimed their weekly reward
  // Missing Route: API route for checking weekly reward status needs to be implemented
  const weeklyRewardResult = await getRequest(
    `/guild/${interaction.guildId}/activities/user/${interaction.user.id}/daily-work-reward?thisWeek=true`
  );

  if (weeklyRewardResult.status === 200) {
    return followUpInteraction(interaction, {
      content: `You have already claimed your reward this week! Please try again in ${getTimeUntil(
        "nextweek"
      )}.`,
      flags: MessageFlags.Ephemeral,
    });
  }

  if (weeklyRewardResult.status !== 404) {
    return followUpInteraction(interaction, {
      content: "An error occurred while checking your weekly reward status.",
      flags: MessageFlags.Ephemeral,
    });
  }

  // Check if the user has a streak of at least 5 days
  // Missing Route: API route for checking activity streak needs to be implemented
  const careerStreak = await getRequest(
    `/guild/${interaction.guildId}/activities/streak/${interaction.user.id}/daily-work`
  );
  if (careerStreak.status !== 200 || careerStreak.data.streak < 5) {
    return followUpInteraction(interaction, {
      content:
        "Oh Uh! You need to have a streak of at least 5 days to claim your weekly reward!",
      flags: MessageFlags.Ephemeral,
    });
  }

  // Get the reward amount based on the streak
  const { streak = 1 } = careerStreak.data;
  const rewardAmount = getReward(streak);

  // Get Job Information
  const { job } = userCareer.data;
  const { emoji, name } = job;

  // Create message embed
  const embed = createCustomEmbed({
    description: `Congratulations! For successfully completing your work-week, **${rewardAmount}** coins have been deposited into your bank account.`,
    footer: { text: `${emoji} ${name} - ${interaction.user.username}` },
  });

  // Store the transfer activity in the database
  // Missing Route: API route for storing activities needs to be implemented
  postRequest(`/guild/${interaction.guild.id}/activities`, {
    guildId: interaction.guild.id,
    userId: interaction.user.id,
    type: "daily-work-reward",
    additional: {
      reward: rewardAmount,
    },
  });

  // Add experience points to the user's career
  // Missing Route: API route for gaining experience points needs to be implemented
  postRequest(
    `/guild/${interaction.guild.id}/economy/exp/gain/${interaction.user.id}`,
    { amount: BASE_REWARD_EXPERIENCE }
  );

  // Give the user the target amount of money
  // Missing Route: API route for bank deposit needs to be implemented
  const bankDeposit = await postRequest(
    `/guild/${interaction.guild.id}/economy/balance/${interaction.user.id}`,
    { amount: rewardAmount, type: 'bank' }
  );
  if (bankDeposit?.status !== 200) {
    return followUpInteraction(interaction, {
      content: `Uh oh! Something went wrong while sending your hard earned money.`,
      flags: MessageFlags.Ephemeral,
    });
  } else {
    // reply with the embed
    return replyInteraction(interaction, {
      embeds: [embed],
    });
  }
};
