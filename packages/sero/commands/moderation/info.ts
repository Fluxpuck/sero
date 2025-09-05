import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../types/client.types";
import { safeReply, safeErrorReply } from "../../utils/message";
import { getRequest } from "../../database/connection";
import { PaginatedApiResponse } from "../../types/response.types";
import { UserAuditLogWithUsers } from "../../types/models/user-audit-logs.types";
import { createPagination } from "../../utils/pagination";
import { format } from "date-fns";

async function getUserLogs(
  guildId: string,
  userId: string,
  source: "executor" | "target",
  page: number = 1,
  limit: number = 5
) {
  let offset = (page - 1) * limit;

  const userLogs = (await getRequest(
    `guild/${guildId}/logs/user/${source}/${userId}?limit=${limit}&offset=${offset}`
  )) as PaginatedApiResponse<UserAuditLogWithUsers[]>;

  return userLogs;
}

/**
 * Create User Logs Pages
 * Utilizing the EmbedBuilder and EmbedField
 */
function createUserLogsEmbed(
  baseEmbed: EmbedBuilder,
  logs: UserAuditLogWithUsers[],
  totalLogs: number,
  currentPage: number,
  totalPages: number
): EmbedBuilder {
  // Create a new embed based on the base embed to avoid accumulating fields
  const embed = new EmbedBuilder()
    .setColor(baseEmbed.data.color || 0x0099ff)
    .setTitle(baseEmbed.data.title || `User Information`)
    .setThumbnail(baseEmbed.data.thumbnail?.url || null);

  // Copy the user information fields from the base embed
  if (baseEmbed.data.fields) {
    // Add user info fields (only the fields that don't start with #)
    const userInfoFields = baseEmbed.data.fields.filter(
      (field) => !field.name.startsWith("#")
    );
    embed.addFields(userInfoFields);
  }

  if (logs.length === 0) {
    embed.addFields({
      name: "\u200B",
      value: `No logs found for this user.`,
      inline: false,
    });
    return embed;
  } else {
    embed.addFields({
      name: "\u200B",
      value: `**(${totalLogs}) Logs found:**`,
      inline: false,
    });
  }

  // Format each log entry
  logs.forEach((log, index) => {
    const logIndex = (currentPage - 1) * logs.length + index + 1;

    const timestamp = new Date(log.createdAt).getTime() / 1000;
    let fieldValue = "";

    if (log.id) {
      fieldValue += `-# ${log.id}\n`;
    }

    if (log.reason) {
      fieldValue += `**Reason:** \`${log.reason}\`\n`;
    }

    if (log.duration) {
      const durationMs = log.duration;
      const durationText = format(
        new Date(durationMs),
        durationMs >= 3600000 ? "h'hr' m'm'" : "m'm'"
      ).trim();

      fieldValue += `**Duration:** ${durationText}\n`;
    }

    if (log.executor) {
      fieldValue += `**Executor:** <@${log.executor.userId}> (${log.executor.username})\n`;
    }

    if (log.createdAt) {
      fieldValue += `**Created:** <t:${Math.floor(timestamp)}:R>\n`;
    }

    fieldValue += "\u200B"; // Add a blank line for spacing

    embed.addFields({
      name: `#${logIndex} - ${log.action}`,
      value: fieldValue,
      inline: false,
    });
  });

  // Add footer with page number
  embed.setFooter({ text: `Page ${currentPage}/${totalPages}` }).setTimestamp();

  return embed;
}

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Get information about a user")
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("Select a user to get information about")
        .setRequired(true)
    ) as SlashCommandBuilder,
  cooldown: 3,

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const isDeferred = interaction.deferred;

    const user = interaction.options.getUser("user");
    if (!user) {
      await safeReply(interaction, "Please provide a user", isDeferred);
      return;
    }

    try {
      // Get the member
      const member = interaction.guild?.members.cache.get(user.id);

      // Create user info embed
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`User Information`)
        .setThumbnail(user.displayAvatarURL({ size: 128 }))
        .addFields(
          { name: "User", value: `<@${user.id}> | ${user.id}`, inline: true },
          {
            name: "Account Created",
            value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
            inline: true,
          }
        );

      // Add member-specific information if the user is in the guild
      if (member) {
        embed.addFields(
          {
            name: "Joined Server",
            value: `<t:${Math.floor(member.joinedTimestamp! / 1000)}:R>`,
            inline: true,
          },
          {
            name: "Roles",
            value:
              member.roles.cache.size > 1
                ? member.roles.cache
                    .filter((role) => role.id !== interaction.guild!.id)
                    .map((role) => `<@&${role.id}>`)
                    .join(", ")
                : "None",
            inline: false,
          }
        );
      } else {
        embed.addFields({
          name: "Server Membership",
          value: "User is not a member of this server",
          inline: false,
        });
      }

      // Get initial user logs
      const initialUserLogs = await getUserLogs(
        interaction.guild!.id,
        user.id,
        "target"
      );
      const initialUserLogsData = initialUserLogs.data || [];
      const {
        page: currentPage = 1,
        limit: pageLimit = 5,
        total: totalLogs = 0,
      } = initialUserLogs;
      const totalPages = Math.ceil(totalLogs / pageLimit) || 1;

      // Create initial embed
      const userInfoEmbed = createUserLogsEmbed(
        embed,
        initialUserLogsData,
        totalLogs,
        currentPage,
        totalPages
      );

      await safeReply(interaction, { embeds: [userInfoEmbed] }, isDeferred);

      // Get the interaction response for pagination
      const response = await interaction.fetchReply();

      // Create a separate message for user logs pagination
      await createPagination(response, {
        itemsPerPage: 5,
        totalItems: totalLogs,
        initialPage: currentPage,
        data: async (page, itemsPerPage) => {
          const logs = await getUserLogs(
            interaction.guild!.id,
            user.id,
            "target",
            page,
            itemsPerPage
          );
          return logs.data || [];
        },
        createEmbed: (items, currentPage, totalPages) => {
          return createUserLogsEmbed(
            embed,
            items,
            totalLogs,
            currentPage,
            totalPages
          );
        },
        timeout: 300_000,
        buttonLabels: {
          previous: "◀ Previous",
          next: "Next ▶",
        },
      });

      return;
    } catch (error) {
      await safeErrorReply(
        interaction,
        error,
        `Could not fetch information for ${user.tag}.`,
        isDeferred
      );
    }

    return;
  },
};

export default command;
