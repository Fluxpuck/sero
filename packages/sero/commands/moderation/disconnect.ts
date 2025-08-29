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
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const isDeferred = interaction.deferred;

    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    if (!user || !reason) {
      await safeReply(
        interaction,
        "Please provide a user and a reason",
        isDeferred
      );
      return;
    }

    if (!interaction.guild) {
      await safeReply(
        interaction,
        "This command can only be used in a server",
        isDeferred
      );
      return;
    }

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      await safeReply(interaction, "User not found", isDeferred);
      return;
    }

    // Check if the user is in a voice channel
    if (!member.voice.channel) {
      await safeReply(
        interaction,
        `<@${member.user.id}> is not connected to any voice channel.`,
        isDeferred
      );
      return;
    }

    const { success, message } = checkPermissions(
      interaction,
      member,
      "disconnect"
    );
    if (!success) {
      await safeReply(interaction, message, isDeferred);
      return;
    }

    try {
      // Store the channel name for the success message
      const channelName = member.voice.channel.name;

      // Disconnect the user
      await member.voice.disconnect(
        `${reason} >> ${interaction.user.username}`
      );

      await safeReply(
        interaction,
        `You successfully disconnected <@${member.user.id}> from voice channel "${channelName}" with reason: ${reason}`,
        isDeferred
      );
    } catch (error) {
      await safeErrorReply(
        interaction,
        error,
        `Could not disconnect <@${member.user.id}>.`,
        isDeferred
      );
    }

    return;
  },
};

export default command;
