import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  ChannelType,
} from "discord.js";
import { Command } from "../../types/client.types";
import { GuildSettingType } from "../../types/models/guild-settings.types";
import { safeReply, safeErrorReply } from "../../utils/message";
import { postRequest } from "../../database/connection";
import { ResponseStatus } from "../../types/response.types";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("set-guild-settings")
    .setDescription("Configure server settings for the bot")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set")
        .setDescription("Set a guild setting")
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("The type of setting to update")
            .setRequired(true)
            .addChoices(
              {
                name: "Welcome Channel",
                value: GuildSettingType.WELCOME_CHANNEL,
              },
              {
                name: "Level Up Channel",
                value: GuildSettingType.LEVEL_UP_CHANNEL,
              },
              {
                name: "XP Reward Drop Channel",
                value: GuildSettingType.EXP_REWARD_DROP_CHANNEL,
              },
              { name: "Birthday Role", value: GuildSettingType.BIRTHDAY_ROLE },
              {
                name: "Birthday Channel",
                value: GuildSettingType.BIRTHDAY_CHANNEL,
              },
              {
                name: "Member Logs Channel",
                value: GuildSettingType.MEMBER_LOGS_CHANNEL,
              },
              {
                name: "Voice Channel Logs",
                value: GuildSettingType.VC_LOGS_CHANNEL,
              },
              {
                name: "Moderation Logs Channel",
                value: GuildSettingType.MODERATION_LOGS_CHANNEL,
              }
            )
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("The channel to set (for channel settings)")
            .setRequired(false)
        )
        .addRoleOption((option) =>
          option
            .setName("role")
            .setDescription(
              "The role to set (for role settings like Birthday Role)"
            )
            .setRequired(false)
        )
    ),
  cooldown: 5,

  async execute(interaction: ChatInputCommandInteraction) {
    // Defer the reply to give us time to process
    await interaction.deferReply();
    const isDeferred = true;

    // Get the setting type
    const type = interaction.options.getString("type") as GuildSettingType;

    // Determine if we need a role or a channel based on the setting type
    let targetId: string;
    let targetName: string = "";

    if (type === GuildSettingType.BIRTHDAY_ROLE) {
      const role = interaction.options.getRole("role");
      if (!role) {
        await safeReply(
          interaction,
          "Please provide a role for the birthday role setting",
          isDeferred,
          true
        );
        return;
      }
      targetId = role.id;
      targetName = role.name;
    } else {
      const channel = interaction.options.getChannel("channel");
      if (!channel) {
        await safeReply(
          interaction,
          "Please provide a channel for this setting",
          isDeferred,
          true
        );
        return;
      }

      // Validate channel type if needed
      if (
        channel.type !== ChannelType.GuildText &&
        channel.type !== ChannelType.GuildAnnouncement
      ) {
        await safeReply(
          interaction,
          "Please provide a text channel for this setting. Voice channels and categories are not supported.",
          isDeferred,
          true
        );
        return;
      }

      targetId = channel.id;
      targetName = channel.name || channel.id;
    }

    if (!type || !targetId) {
      await safeReply(
        interaction,
        "Please provide a valid type and target (channel or role)",
        isDeferred,
        true
      );
      return;
    }

    try {
      // Make API call to update the guild settings using the proper utility
      const response = await postRequest(
        `guild/${interaction.guild!.id}/settings`,
        {
          type,
          targetId,
        }
      );

      if (response.status === ResponseStatus.ERROR) {
        throw new Error(`Failed to update guild settings: ${response.message}`);
      }

      // Format a nice success message
      const settingName = type
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
      const targetType =
        type === GuildSettingType.BIRTHDAY_ROLE ? "role" : "channel";

      await safeReply(
        interaction,
        `✅ ${settingName} has been set successfully to ${
          targetType === "role" ? `<@&${targetId}>` : `<#${targetId}>`
        }`,
        isDeferred
      );
    } catch (error) {
      // Use safeErrorReply for error handling
      await safeErrorReply(
        interaction,
        error,
        "Failed to update guild settings:",
        true
      );
    }

    return;
  },
};

export default command;
