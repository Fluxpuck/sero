import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../types/client.types";
import { postRequest } from "../../database/connection";
import { safeReply, safeErrorReply } from "../../utils/message";

// Helper function to format duration in seconds to a human-readable string
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} seconds`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''}`;
  
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''}`;
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("boost")
    .setDescription("Set the server's exp multiplier")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addIntegerOption((option) =>
      option
        .setName("multiplier")
        .setDescription("Amount of exp multiplier")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(10)
    )
    .addIntegerOption((option) =>
      option
        .setName("duration")
        .setDescription("Duration in seconds (leave empty for permanent)")
        .setRequired(false)
        .setMinValue(60) // Minimum 1 minute
    ) as SlashCommandBuilder,
  cooldown: 60,

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    
    try {
      const multiplier = interaction.options.getInteger("multiplier");
      const duration = interaction.options.getInteger("duration");
      
      if (!multiplier) {
        await safeReply(interaction, "Please provide a multiplier", true);
        return;
      }
      
      const response = await postRequest(
        `/guild/${interaction.guildId}/levels/multiplier`,
        {
          multiplier,
          duration
        }
      );
      
      if (response.status === "success") {
        const embed = new EmbedBuilder()
          .setTitle("🚀 Server XP Boost Set")
          .setColor(0x00FF00)
          .setDescription(`The server's XP multiplier has been set to **${multiplier}x**`)
          .addFields(
            { name: "Multiplier", value: `${multiplier}x`, inline: true },
            { 
              name: "Duration", 
              value: duration ? `${formatDuration(duration)}` : "Permanent", 
              inline: true 
            },
            { 
              name: "Expires", 
              value: response.data.expireAt ? 
                `<t:${Math.floor(new Date(response.data.expireAt).getTime() / 1000)}:R>` : 
                "Never", 
              inline: true 
            }
          )
          .setTimestamp();
          
        await safeReply(interaction, { embeds: [embed] }, true);
      } else {
        await safeReply(
          interaction, 
          `Failed to set multiplier: ${response.message || 'Unknown error'}`,
          true
        );
      }
    } catch (error) {
      await safeErrorReply(
        interaction,
        error,
        "Error setting server XP multiplier:",
        true
      );
    }
  },
};

export default command;
