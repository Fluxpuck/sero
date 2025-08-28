import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  AutocompleteInteraction,
  MessageFlags,
} from "discord.js";
import { Command } from "../../types/client.types";
import { getRequest } from "../../database/connection";
import { checkPermissions } from "../../utils/permissions";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("disconnect")
    .setDescription("Disconnect a user from a voice channel")
    .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Select a user to disconnect")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Type a reason to disconnect the user")
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

    const result = await getRequest(
      "/assets/prereason-messages?type=disconnect"
    );
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
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    if (!user || !reason) {
      interaction.reply({
        content: "Please provide a user and a reason",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const member = interaction.guild?.members.cache.get(user.id);
    if (!member) {
      interaction.reply({
        content: "User not found",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const { success, message } = checkPermissions(interaction, member, "disconnect");
    if (!success) {
      interaction.reply({
        content: message,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      await member.voice.disconnect();
      interaction.reply({
        content: `You successfully disconnected <@${member.user.id}>`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      interaction.reply({
        content: `Could not disconnect <@${member.user.id}>.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    return;
  },
};

export default command;
