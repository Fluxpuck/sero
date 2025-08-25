import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { format } from "date-fns";
import { Command } from "../types/client.types";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Provides information about the bot")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  cooldown: 60,

  async execute(interaction: ChatInputCommandInteraction) {
    const { client } = interaction;
    const botVersion = process.env.npm_package_version || "1.0.0";
    const discordVersion = require("discord.js").version;

    // Setting up the embedded message
    const messageEmbed = new EmbedBuilder()
      .setTitle(client.user?.username || "Bot")
      .setThumbnail(client.user?.displayAvatarURL())
      .setDescription(
        `${
          client.user?.username || "Bot"
        } is a Discord bot written in TypeScript using the Discord.js library.`
      )
      .addFields(
        { name: "Version", value: botVersion, inline: true },
        { name: "Discord.js", value: discordVersion, inline: true },
        {
          name: "Uptime",
          value: format(client.uptime, "HH:mm:ss"),
          inline: true,
        }
      );

    // Sending the message
    await interaction.reply({ embeds: [messageEmbed] });
  },
};

export default command;
