const { MessageFlags } = require("discord.js");
const { getRequest } = require("../../database/connection");
const { generateSnowflake } = require("../../lib/discord/snowflake");
const eventEnum = require("../../config/eventEnum");
const {
  deferInteraction,
  replyInteraction,
} = require("../../utils/InteractionManager");

module.exports.props = {
  commandName: "drop-reward",
  description: "Manually trigger a reward drop",
  usage: "/drop-reward",
  interaction: {
    type: 1,
    options: [],
  },
  defaultMemberPermissions: ["ManageGuild"],
  cooldown: 1 * 60, // 1 minute cooldown
};

module.exports.run = async (client, interaction) => {
  await deferInteraction(interaction, true);

  // Missing Route: API route for fetching reward drop settings needs to be implemented
  const rewardDropSetting = await getRequest(
    `/guild/${interaction.guild.id}/settings/exp-reward-drops`
  );
  if (rewardDropSetting.status !== 200) {
    return replyInteraction(interaction, {
      content: "Oops! Could not fetch the reward drop guild settings.",
      flags: MessageFlags.Ephemeral,
    });
  }

  // Set the guildId, targetId, and token
  const { guildId, targetId } = rewardDropSetting.data;
  const token = generateSnowflake();
  const payload = {
    guildId,
    channelId: targetId,
    token,
    executedBy: interaction.user.id,
  };

  try {
    // Emit the guildRewardDrops event
    client.emit(eventEnum.GUILD_REWARD_DROPS, payload);
  } catch (error) {
    return replyInteraction(interaction, {
      content: "Oops! Could not trigger the reward drop.",
      flags: MessageFlags.Ephemeral,
    });
  }

  // Reply to the interaction
  replyInteraction(interaction, {
    content: "*Watch out! A reward drop has been triggered.*",
    flags: MessageFlags.Ephemeral,
  });
};
