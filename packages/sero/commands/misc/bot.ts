import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { format } from "date-fns";
import { Command } from "../../types/client.types";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("bot")
    .setDescription("Provides information about the bot")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  cooldown: 60,

  async execute(interaction: ChatInputCommandInteraction) {
    const { client } = interaction;
    const botVersion = process.env.npm_package_version || "1.0.0";
    const discordVersion = require("discord.js").version;

    // Setting up the embedded message
    const messageEmbed = new EmbedBuilder()
      .setTitle(client.user.username)
      .setThumbnail(client.user.displayAvatarURL())
      .setDescription(`Bot created by ${client.user.username}`)
      .addFields(
        { name: "Version", value: botVersion, inline: true },
        { name: "Discord.js", value: discordVersion, inline: true },
        {
          name: "Uptime",
          value: format(client.uptime, "HH:mm:ss"),
          inline: true,
        }
      );

    // Creating support button
    const supportButton = new ButtonBuilder()
      .setLabel("Support on Patreon")
      .setURL("https://www.patreon.com/c/fluxpuck")
      .setStyle(ButtonStyle.Link);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      supportButton
    );

    // Sending the message with support button
    await interaction.reply({ embeds: [messageEmbed], components: [row] });
  },
};

export default command;
