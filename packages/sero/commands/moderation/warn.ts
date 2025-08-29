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
    .setName("warn")
    .setDescription("Warn a user")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Select a user to warn")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Type a reason to warn the user")
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

    const result = await getRequest("/assets/prereason-messages?type=warn");
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

    const { success, message } = checkPermissions(interaction, member, "warn");
    if (!success) {
      await safeReply(interaction, message, isDeferred);
      return;
    }

    try {
      // Send the warning message to the user
      await member.send({
        content: `<@${member.user.id}>, you have been warned in **${interaction.guild?.name}** for the following reason: ${reason}`,
      });

      // Send a success message to the author
      await safeReply(
        interaction,
        `You successfully warned <@${member.user.id}> with the following message:\n> ${reason}`,
        isDeferred
      );
    } catch (error) {
      await safeErrorReply(
        interaction,
        error,
        `Could not warn <@${member.user.id}>. User may have DMs disabled or is not in the server.`,
        isDeferred
      );
    }

    return;
  },
};

export default command;
