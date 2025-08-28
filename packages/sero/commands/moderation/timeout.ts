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
    const user = interaction.options.getUser("user");
    const duration = interaction.options.getInteger("duration");
    const reason = interaction.options.getString("reason");
    if (!user || !duration || !reason) {
      interaction.reply({
        content: "Please provide a user, a duration and a reason",
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

    const { success, message } = checkPermissions(
      interaction,
      member,
      "timeout"
    );
    if (!success) {
      interaction.reply({
        content: message,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    try {
      // Timeout the user
      await member.timeout(
        duration * 60 * 1000,
        `${reason} >> ${interaction.user.username}`
      );

      // Send a success message to the author
      interaction.reply({
        content: `You successfully timeout <@${member.user.id}> with the following message:\n> ${reason}`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (error) {
      interaction.reply({
        content: `Could not timeout <@${member.user.id}>.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    return;
  },
};

export default command;
