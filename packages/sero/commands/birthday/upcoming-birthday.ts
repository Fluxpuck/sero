import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";
import { Command } from "../../types/client.types";
import { getRequest } from "../../database/connection";
import { ResponseCode } from "../../types/response.types";
import { safeReply } from "../../utils/message";
import { format } from "date-fns";
import { UserBirthdayData } from "../../types/models/user-birthday.types";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("upcoming-birthday")
    .setDescription("Check the upcoming birthdays of the server")
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .addIntegerOption((option) =>
      option
        .setName("days")
        .setDescription("Number of days to look ahead (default: 7)")
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(365)
    ) as SlashCommandBuilder,
  cooldown: 60,

  async execute(interaction: ChatInputCommandInteraction) {
    const days = interaction.options.getInteger("days") || 7;

    const upcomingBirthday = await getRequest(
      `/guild/${interaction.guildId}/birthday/upcoming?range=${days}`
    );

    if (upcomingBirthday.code === ResponseCode.SUCCESS) {
      const birthdays = upcomingBirthday.data;

      // Create an embed for upcoming birthdays
      const embed = new EmbedBuilder()
        .setColor("#feca2c")
        .setTitle("🎂 Upcoming Birthdays")
        .setDescription(
          `Here are the upcoming birthdays in the next ${days} day${
            days !== 1 ? "s" : ""
          }!`
        )
        .setThumbnail(interaction.guild?.iconURL({ size: 128 }) || null);

      if (!birthdays || birthdays.length === 0) {
        // No birthdays in the specified time range
        embed.setDescription(
          `No birthdays coming up in the next ${days} day${
            days !== 1 ? "s" : ""
          }!`
        );
      } else {
        const MAX_BIRTHDAYS = 10;
        const totalBirthdays = birthdays.length;

        // Sort all birthdays by how soon they are
        const sortedBirthdays = birthdays.sort(
          (a: UserBirthdayData, b: UserBirthdayData) =>
            (a.daysUntil ?? Infinity) - (b.daysUntil ?? Infinity)
        );

        // Take only the ones we're going to display
        const birthdaysToDisplay = sortedBirthdays.slice(0, MAX_BIRTHDAYS);

        // Group this smaller list by date for a clean display
        const birthdaysByDate: Record<string, UserBirthdayData[]> = {};
        birthdaysToDisplay.forEach((birthday: UserBirthdayData) => {
          if (birthday.upcomingDate) {
            const date = format(new Date(birthday.upcomingDate), "MMMM d");
            if (!birthdaysByDate[date]) {
              birthdaysByDate[date] = [];
            }
            birthdaysByDate[date].push(birthday);
          }
        });

        // Add a field for each date group
        for (const date in birthdaysByDate) {
          const usersOnThisDate = birthdaysByDate[date];
          const daysUntil = usersOnThisDate[0]?.daysUntil;

          if (typeof daysUntil === "undefined") continue;

          const fieldName =
            daysUntil === 0
              ? `🎉 Today (${date})`
              : daysUntil === 1
              ? `🎂 Tomorrow (${date})`
              : `🗓️ In ${daysUntil} days (${date})`;

          const userList = usersOnThisDate
            .map((b) => {
              const username = b.User?.username || `<@${b.userId}>`;
              const ageInfo = b.age ? ` (${b.age} years)` : "";
              return `${username}${ageInfo}`;
            })
            .join("\n");

          embed.addFields({ name: fieldName, value: userList });
        }

        // Add a footer if there are more birthdays than we've shown
        if (totalBirthdays > MAX_BIRTHDAYS) {
          const remaining = totalBirthdays - MAX_BIRTHDAYS;
          embed.addFields({
            name: "\u200B", // Zero-width space for a separator
            value: `*...and ${remaining} more birthday${
              remaining !== 1 ? "s" : ""
            } in the next ${days} days*`,
          });
        }
      }

      embed.setFooter({ text: `Use /birthday to set your own birthday!` });

      safeReply(interaction, { embeds: [embed] }, false, false);
    } else {
      safeReply(
        interaction,
        "Oops! Something went wrong. Please try again later."
      );
    }

    return;
  },
};

export default command;
