import {
  Client,
  Guild,
  TextChannel,
  NewsChannel,
  ThreadChannel,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ButtonInteraction,
  EmbedBuilder,
  Colors,
} from "discord.js";
import { Event } from "../types/client.types";
import { RedisChannel } from "../redis/subscribe";
import { logger } from "../utils/logger";
import { getUniqueAuthorsFromMessages } from "../utils/message";
import { getRequest, postRequest } from "../database/connection";

type DropEventPayload = {
  guildId: string;
  channelId: string;
};

/**
 * Utility function for creating reward drop UI elements
 * @param type The type of UI element to create: 'button', 'embed', or 'claimedEmbed'
 * @param options Options for the UI element
 * @returns The requested UI element
 */
function createRewardDropEmbed(message: string): {
  embed: EmbedBuilder;
  button: ActionRowBuilder<ButtonBuilder>;
} {
  const claimButton = new ButtonBuilder()
    .setCustomId("claim_reward")
    .setLabel("Claim Reward")
    .setStyle(ButtonStyle.Success)
    .setEmoji("🎁");

  const buttomComponent = new ActionRowBuilder<ButtonBuilder>().addComponents(
    claimButton
  );

  const rewardDropEmbed = new EmbedBuilder()
    .setTitle("🎁 Random Reward Drop! 🎁")
    .setDescription(`${message}\nQuick, claim it before someone else does!`)
    .setColor(Colors.Yellow);

  return { embed: rewardDropEmbed, button: buttomComponent };
}

const event: Event = {
  name: RedisChannel.GUILD_DROP_REWARD,
  once: false,
  async execute(message: DropEventPayload, client: Client): Promise<any> {
    if (!message || !client) return; // Skip empty messages
    logger.debug("Processing drop message", message);

    try {
      const guild = client.guilds.cache.get(message.guildId) as Guild;
      if (!guild) return;

      const channel = guild.channels.cache.get(message.channelId) as
        | TextChannel
        | NewsChannel
        | ThreadChannel;
      if (!channel || !channel.isTextBased()) return;

      // Get active members from the last 5 minutes
      const activeMemberIds = await getUniqueAuthorsFromMessages(channel, 5);

      // Get randomized template messages
      const [rewardDropData, claimRewardData] = await Promise.all([
        getRequest("/assets/template-messages?type=reward-drop&random=true"),
        getRequest("/assets/template-messages?type=claim-reward&random=true"),
      ]);

      const rewardDropMessage =
        rewardDropData?.data?.[0]?.message ||
        "A random reward drop has been dropped!";
      const claimRewardMessage =
        claimRewardData?.data?.[0]?.message ||
        "{{USER}} has successfully claimed {{AMOUNT}} exp!";

      // Track if the reward has been claimed
      let claimed = false;

      // Create the button and embed using the unified helper function
      const { button: actionRow, embed: rewardEmbed } =
        createRewardDropEmbed(rewardDropMessage);

      // Send message with button
      const sentMessage = await channel.send({
        embeds: [rewardEmbed],
        components: [actionRow],
      });

      // Collect interaction
      const collector = sentMessage.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 10000, // 10 seconds
      });

      // Handle button interactions
      collector.on("collect", async (interaction: ButtonInteraction) => {
        // Get the user who clicked the button
        const userId = interaction.user.id;

        // Check if the user is in the activeMemberCollection
        if (!activeMemberIds.includes(userId)) {
          // User is not eligible
          await interaction.reply({
            content:
              "Sorry, you are not eligible for this reward. Only members who were active in this channel recently can claim it.",
            ephemeral: true,
          });
          return;
        }

        // Check if reward has already been claimed
        if (claimed) {
          await interaction.reply({
            content:
              "Sorry, this reward has already been claimed by someone else!",
            ephemeral: true,
          });
          return;
        }

        // Claim the reward
        claimed = true;
        collector.stop();

        // Generate random reward amount between 200 and 500
        const targetAmount = Math.floor(Math.random() * 301) + 200;

        // Replace placeholders in claim reward message
        const claimRewardMessageReplaced = claimRewardMessage
          .replace("{{USER}}", `<@${interaction.user.id}>`)
          .replace("{{AMOUNT}}", targetAmount);

        // Send the success message to the user
        interaction.followUp({
          content: `${claimRewardMessageReplaced}`,
        });

        // Record the claim in the database
        try {
          await postRequest(`/guild/${guild.id}/levels/give/${userId}`, {
            amount: targetAmount,
            originId: client.user?.id,
          });
          logger.debug(`User ${userId} claimed reward in guild ${guild.id}`);
        } catch (error) {
          logger.error("Failed to record reward claim:", error);
        }
      });

      // Handle collector end (timeout or manual stop)
      collector.on("end", async (collected) => {
        // If nobody claimed the reward and the message is still there
        if (!claimed) {
          try {
            // Just delete the message when expired
            await sentMessage.delete();
          } catch (error) {
            logger.error("Error deleting expired reward message:", error);
          }
        }
      });
    } catch (error) {
      logger.error(`Error processing drop message`, error);
    }
  },
};

export default event;
