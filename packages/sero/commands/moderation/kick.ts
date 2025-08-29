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
import { safeReply, safeErrorReply } from "../../utils/message";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Select a user to kick")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Type a reason to kick the user")
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

    const result = await getRequest("/assets/prereason-messages?type=kick");
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
    await interaction.deferReply({ ephemeral: true });
    const isDeferred = interaction.deferred;

    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    if (!user || !reason) {
      await safeReply(interaction, "Please provide a user and a reason", isDeferred);
      return;
    }

    const member = interaction.guild?.members.cache.get(user.id);
    if (!member) {
      await safeReply(interaction, "User not found", isDeferred);
      return;
    }

    const { success, message } = checkPermissions(interaction, member, "kick");
    if (!success) {
      await safeReply(interaction, message, isDeferred);
      return;
    }

    try {
      // Kick the user
      await member.kick(`${reason} >> ${interaction.user.username}`);

      // Send a success message to the author
      await safeReply(
        interaction,
        `You successfully kicked <@${member.user.id}> with the following message:\n> ${reason}`,
        isDeferred
      );
    } catch (error) {
      await safeErrorReply(
        interaction,
        error,
        `Could not kick <@${member.user.id}>.`,
        isDeferred
      );
    }

    return;
  },
};

export default command;
