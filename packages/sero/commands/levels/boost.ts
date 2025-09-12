import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { Command } from "../../types/client.types";
import { postRequest } from "../../database/connection";

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
    ) as SlashCommandBuilder,
  cooldown: 60,

  async execute(interaction: ChatInputCommandInteraction) {
    const multiplier = interaction.options.getInteger("multiplier");
    if (!multiplier) {
      interaction.reply({ content: "Please provide a multiplier" });
      return;
    }

    const reponse = await postRequest(
      `/guild/${interaction.guildId}/levels/multiplier`,
      {
        multiplier,
      }
    );

    await interaction.reply({ content: "Multiplier set to " + multiplier });
  },
};

export default command;
