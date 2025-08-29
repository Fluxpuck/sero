import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  MessageFlags,
  EmbedBuilder,
  GuildMember,
  User,
} from "discord.js";
import { Command } from "../../types/client.types";
import { safeReply, safeErrorReply } from "../../utils/message";

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
  cooldown: 60,

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const isDeferred = interaction.deferred;

    const user = interaction.options.getUser("user");
    if (!user) {
      await safeReply(interaction, "Please provide a user", isDeferred);
      return;
    }

    try {
      const member = interaction.guild?.members.cache.get(user.id);

      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`User Information: ${user.tag}`)
        .setThumbnail(user.displayAvatarURL({ size: 128 }))
        .addFields(
          { name: "User ID", value: user.id, inline: true },
          {
            name: "Account Created",
            value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
            inline: true,
          }
        )
        .setTimestamp();

      // Add member-specific information if the user is in the guild
      if (member) {
        embed.addFields(
          {
            name: "Joined Server",
            value: `<t:${Math.floor(member.joinedTimestamp! / 1000)}:R>`,
            inline: true,
          },
          { name: "Nickname", value: member.nickname || "None", inline: true },
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

      await safeReply(interaction, { embeds: [embed] }, isDeferred);
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
