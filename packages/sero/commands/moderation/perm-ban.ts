import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  AutocompleteInteraction,
} from "discord.js";
import { Command } from "../../types/client.types";
import { getRequest } from "../../database/connection";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("perm-ban")
    .setDescription("Permanently ban a user")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Select a user to permanently ban")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Type a reason to permanently ban the user")
        .setRequired(true)
        .setMaxLength(250)
        .setAutocomplete(true)
    ) as SlashCommandBuilder,
  cooldown: 60,

  async autocomplete(interaction: AutocompleteInteraction) {
    const focusedReason = interaction.options
      .getFocused()
      .toString()
      .toLowerCase();

    const result = await getRequest("/assets/prereason-messages?type=ban");
    const reasons = result?.data || [];

    const filteredReasons = reasons
      .filter((item: any) => item.message.toLowerCase().includes(focusedReason))
      .map((item: any) => ({
        name: item.message,
        value: item.message,
      }))
      .slice(0, 25);

    await interaction.respond(filteredReasons);
  },

  async execute(interaction: ChatInputCommandInteraction) {
    return;
  },
};

export default command;
