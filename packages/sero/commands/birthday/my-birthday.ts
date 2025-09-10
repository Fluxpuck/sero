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

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("my-birthday")
    .setDescription("Check your birthday settings")
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages),
  cooldown: 60,

  async execute(interaction: ChatInputCommandInteraction) {
    const userBirthday = await getRequest(
      `/guild/${interaction.guildId}/birthday/${interaction.user.id}`
    );

    if (userBirthday.code === ResponseCode.SUCCESS) {
      const { age, isPG, upcomingDate, daysUntil, updatedAt } =
        userBirthday?.data;

      // Check if the user has age and setup and set birthDate
      const hasAge = age !== null && isPG;

      // Create an embed with the birthday information
      const birthdayEmbed = new EmbedBuilder()
        .setColor("#feca2c")
        .setTitle(`🎂 Birthday Settings`)
        .setDescription(
          `Here are your birthday settings, ${interaction.user.toString()}!`
        )
        .setThumbnail(interaction.user.displayAvatarURL({ size: 128 }))
        .setFooter({
          text: `Birthday set on ${format(
            new Date(updatedAt),
            "MMMM d, yyyy"
          )}`,
        });

      // Add fields based on conditions
      const fields = [];

      // Only add age field if hasAge is true
      if (hasAge) {
        fields.push({
          name: "Age",
          value: `${age} years`,
          inline: true,
        });
      }

      // Add birthday field with error handling
      fields.push({
        name: "Birthday",
        value: upcomingDate
          ? `${format(new Date(upcomingDate), "MMMM d")}`
          : "Unknown",
        inline: true,
      });

      // Add a blank field for better spacing if age isn't shown
      if (!hasAge) {
        fields.push({
          name: "\u200B",
          value: "\u200B",
          inline: true,
        });
      }

      // Add days until field
      fields.push({
        name: "Days Until",
        value:
          daysUntil !== null
            ? `${daysUntil} day${daysUntil !== 1 ? "s" : ""}`
            : "Unknown",
        inline: true,
      });

      // Add all fields to the embed
      birthdayEmbed.addFields(fields);

      safeReply(interaction, { embeds: [birthdayEmbed] }, false, false);
    } else {
      safeReply(
        interaction,
        "You have not set your birthday yet. Use `/birthday` to set it."
      );
    }
    return;
  },
};

export default command;
