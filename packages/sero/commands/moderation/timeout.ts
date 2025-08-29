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
    .setName("timeout")
    .setDescription("Temporarily timeout a user")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Select a user to timeout")
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("duration")
        .setDescription("Type the duration in minutes to timeout the user")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(1440)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Type a reason to timeout the user")
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

    const result = await getRequest("/assets/prereason-messages?type=mute");
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
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const isDeferred = interaction.deferred;

    const user = interaction.options.getUser("user");
    const duration = interaction.options.getInteger("duration");
    const reason = interaction.options.getString("reason");
    if (!user || !duration || !reason) {
      await safeReply(
        interaction,
        "Please provide a user, a duration and a reason",
        isDeferred
      );
      return;
    }

    const member = interaction.guild?.members.cache.get(user.id);
    if (!member) {
      await safeReply(interaction, "User not found", isDeferred);
      return;
    }

    const { success, message } = checkPermissions(
      interaction,
      member,
      "timeout"
    );
    if (!success) {
      await safeReply(interaction, message, isDeferred);
      return;
    }

    try {
      // Timeout the user
      await member.timeout(
        duration * 60 * 1000,
        `${reason} >> ${interaction.user.username}`
      );

      // Send a success message to the author
      await safeReply(
        interaction,
        `You successfully timeout <@${member.user.id}> with the following message:\n> ${reason}`,
        isDeferred
      );
    } catch (error) {
      await safeErrorReply(
        interaction,
        error,
        `Could not timeout <@${member.user.id}>.`,
        isDeferred
      );
    }

    return;
  },
};

export default command;
