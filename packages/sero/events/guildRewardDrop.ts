import {
  Client,
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
import { getUniqueAuthorsFromMessages, safeReply } from "../utils/message";
import { getRequest, postRequest } from "../database/connection";
import { ResponseStatus } from "../types/response.types";

const log = logger("guild-reward-drop");

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
    log.debug("Processing reward drop message", message);

    try {
      const guild = await client.guilds.fetch(message.guildId);
      if (!guild) return;

      const channel = await client.channels.fetch(message.channelId);
      const textChannel = channel as TextChannel | NewsChannel | ThreadChannel;
      if (!channel || !textChannel || !textChannel.isTextBased()) return;

      // Get active members from the last 5 minutes
      const activeMemberIds = await getUniqueAuthorsFromMessages(
        textChannel,
        5
      );

      // Get randomized template messages using the dedicated random routes
      const [rewardDropData, claimRewardData] = await Promise.all([
        getRequest("/assets/template-messages/random/reward-drop"),
        getRequest("/assets/template-messages/random/claim-reward"),
      ]);

      const rewardDropMessage =
        rewardDropData?.data?.message ||
        "A random reward drop has been dropped!";
      const claimRewardMessage =
        claimRewardData?.data?.message ||
        "{{USER}} has successfully claimed {{AMOUNT}} exp!";

      // Track if the reward has been claimed
      let claimed = false;

      // Create the button and embed using the unified helper function
      const { button: actionRow, embed: rewardEmbed } =
        createRewardDropEmbed(rewardDropMessage);

      // Send message with button
      const rewardDrop = await textChannel.send({
        embeds: [rewardEmbed],
        components: [actionRow],
      });

      // Collect interaction
      const collector = rewardDrop.createMessageComponentCollector({
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
          await safeReply(
            interaction,
            "Sorry, you are not eligible for this reward. Only members who were active in this channel recently can claim it.",
            false,
            true
          );
          return;
        }

        // Check if reward has already been claimed
        if (claimed) {
          await safeReply(
            interaction,
            "Sorry, this reward has already been claimed by someone else!",
            false,
            true
          );
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

        // Update the message to show who claimed the reward
        await rewardDrop.edit({
          content: claimRewardMessageReplaced,
          embeds: [],
          components: [],
        });

        // Record the claim in the database
        const claimResponse = await postRequest(
          `/guild/${guild.id}/levels/claim/${userId}`,
          {
            originId: client.user?.id,
          }
        );

        if (claimResponse.status == ResponseStatus.SUCCESS) {
          log.debug(`User ${userId} claimed reward in guild ${guild.id}`);
        } else {
          log.error(
            `Failed to claim reward for user ${userId} in guild ${guild.id}`,
            claimResponse.message
          );
        }
      });

      // Handle collector end (timeout or manual stop)
      collector.on("end", async (collected) => {
        try {
          if (!claimed) {
            await rewardDrop.delete(); // Just delete the message when expired
          }
        } catch (error) {
          log.error("Error deleting expired reward message:", error);
        }
      });
    } catch (error) {
      log.error(`Error processing drop message`, error);
    }
  },
};

export default event;
