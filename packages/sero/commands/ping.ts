import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../types/client.types";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong and latency information!")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
  cooldown: 60,

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({ content: "Pinging..." });
    const sent = await interaction.fetchReply();
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(`Pong! 🏓 (${latency}ms)`);
  },
};

export default command;
