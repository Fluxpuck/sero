const { MessageFlags } = require("discord.js");
const { getRequest, postRequest } = require("../../database/connection");
const {
  getTimeUntil,
} = require("../../lib/helpers/TimeDateHelpers/timeHelper");
const {
  TREASURE_MESSAGES_NEGATIVE,
  TREASURE_MESSAGES_POSITIVE,
} = require("../../assets/treasure-messages");
const {
  deferInteraction,
  replyInteraction,
  followUpInteraction,
} = require("../../utils/InteractionManager");

module.exports.props = {
  commandName: "treasure-hunt",
  description: "Hunt for treasure and earn rewards.",
  usage: "/treasure-hunt",
  interaction: {
    type: 1,
    options: [],
  },
  defaultMemberPermissions: ["SendMessages"],
};

module.exports.run = async (client, interaction) => {
  await deferInteraction(interaction, false);

  // Check if the user has already searched for treasure this hour
  const hourlyRewardResult = await getRequest(
    `/guilds/${interaction.guildId}/activities/user/${interaction.user.id}/treasure-hunt?thisHour=true`
  );

  if (hourlyRewardResult.status === 200) {
    return await followUpInteraction(interaction, {
      content: `You've already searched for treasure! Please try again in ${getTimeUntil(
        "nexthour"
      )}.`,
      flags: MessageFlags.Ephemeral,
    });
  }

  const isPositive = Math.random() < 0.6; // 60% chance of positive reward
  const MIN_POSITIVE_REWARD = 80;
  const MAX_POSITIVE_REWARD = 250;
  const MIN_NEGATIVE_REWARD = -200;
  const MAX_NEGATIVE_REWARD = -80;

  const rewardAmount = isPositive
    ? Math.floor(
        Math.random() * (MAX_POSITIVE_REWARD - MIN_POSITIVE_REWARD + 1)
      ) + MIN_POSITIVE_REWARD
    : Math.floor(
        Math.random() * (MAX_NEGATIVE_REWARD - MIN_NEGATIVE_REWARD + 1)
      ) + MIN_NEGATIVE_REWARD;

  // Deposit the reward amount to the user's wallet - allowReset is set to true by default
  const walletTransaction = await postRequest(
    `guilds/${interaction.guild.id}/economy/wallet/${interaction.user.id}`,
    { amount: rewardAmount, allowReset: true }
  );
  // Get the true amount of the transaction
  const transactionAmount =
    walletTransaction?.data?.transaction?.trueAmount ?? rewardAmount;

  if (walletTransaction?.status !== 200) {
    return followUpInteraction(interaction, {
      content: `Uh oh! Something went wrong while sending your hard earned money.`,
      flags: MessageFlags.Ephemeral,
    });
  }

  try {
    // Store the activity in the database
    await postRequest(`/guilds/${interaction.guild.id}/activities`, {
      guildId: interaction.guild.id,
      userId: interaction.user.id,
      type: "treasure-hunt",
      additional: { reward: transactionAmount },
    });
  } catch (error) {
    console.error("Failed to store treasure hunt activity:", error);
  }

  if (transactionAmount === 0) {
    return followUpInteraction(interaction, {
      content:
        "Damnnnnn! Seems like you are already too broke to lose any more money. Better luck next time!",
      flags: MessageFlags.Ephemeral,
    });
  } else {
    // Only if the reward is positive
    // Add experience points to the user's career
    // No amount is passed, so the default amount is used (100)
    postRequest(
      `/guilds/${interaction.guild.id}/economy/exp/gain/${interaction.user.id}`
    );
  }

  if (walletTransaction?.status === 400) {
    return followUpInteraction(interaction, {
      content: `You've hit your wallet limit! Please deposit some money in the bank to continue.`,
      flags: MessageFlags.Ephemeral,
    });
  }

  // Generate random treasure message
  const TREASURE_MESSAGES = isPositive
    ? TREASURE_MESSAGES_POSITIVE
    : TREASURE_MESSAGES_NEGATIVE;
  const treasureMessage = TREASURE_MESSAGES[
    Math.floor(Math.random() * TREASURE_MESSAGES.length)
  ].replace("{COIN}", `**${Math.abs(rewardAmount)}**`);

  return replyInteraction(interaction, {
    content: treasureMessage,
    flags: MessageFlags.Ephemeral,
  });
};
