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
    .setName("ban")
    .setDescription("Temporarily ban a user")
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Select a user to ban")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Type a reason to ban the user")
        .setRequired(true)
        .setMaxLength(250)
        .setAutocomplete(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("duration")
        .setDescription("Type the duration in days to ban the user")
        .setRequired(false)
        .setAutocomplete(true)
    ) as SlashCommandBuilder,
  cooldown: 60,

  async autocomplete(interaction: AutocompleteInteraction) {
    const focusedOption = interaction.options.getFocused(true);

    if (focusedOption.name === "reason") {
      const focusedReason = focusedOption.value.toString().toLowerCase();

      const result = await getRequest("/assets/prereason-messages?type=ban");
      const reasons = result?.data || [];

      const filteredReasons = reasons
        .filter((item: any) =>
          item.message.toLowerCase().includes(focusedReason)
        )
        .map((item: any) => ({
          name: item.message,
          value: item.message,
        }))
        .slice(0, 25);

      await interaction.respond(filteredReasons);
    } else if (focusedOption.name === "duration") {
      const durationOptions = [
        { name: "1 year", value: 365 },
        { name: "6 months", value: 180 },
        { name: "1 month", value: 30 },
        { name: "1 week", value: 7 },
      ];

      await interaction.respond(durationOptions);
    }
  },

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const isDeferred = interaction.deferred;

    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason");
    const duration = interaction.options.getInteger("duration");
    if (!user || !reason || !duration) {
      await safeReply(
        interaction,
        "Please provide a user, a reason and a duration",
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

    const { success, message } = checkPermissions(interaction, member, "ban");
    if (!success) {
      await safeReply(interaction, message, isDeferred);
      return;
    }

    try {
      // Check if user is already banned
      const banList = await interaction.guild.bans.fetch();
      const alreadyBanned = banList.find((ban) => ban.user.id === user.id);

      if (alreadyBanned) {
        await safeReply(
          interaction,
          `<@${user.id}> is already banned from this server.`,
          isDeferred
        );
        return;
      }

      // Ban the user
      await member.ban({
        reason: `${reason} >> ${interaction.user.username}`,
        deleteMessageSeconds: 60 * 60 * 24, // Delete messages from the last day
      });

      // Send a success message to the author
      await safeReply(
        interaction,
        `You successfully banned <@${member.user.id}> with the following message:\n> ${reason}`,
        isDeferred
      );
    } catch (error) {
      await safeErrorReply(
        interaction,
        error,
        `Could not ban <@${member.user.id}>.`,
        isDeferred
      );
    }

    return;
  },
};

export default command;
