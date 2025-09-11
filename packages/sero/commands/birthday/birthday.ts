import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  AutocompleteInteraction,
} from "discord.js";
import { Command } from "../../types/client.types";
import { getRequest, postRequest } from "../../database/connection";
import { ResponseCode } from "../../types/response.types";
import { safeReply } from "../../utils/message";

const command: Command = {
  data: new SlashCommandBuilder()
    .setName("birthday")
    .setDescription("Set your birthday")
    .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
    .addIntegerOption((option) =>
      option
        .setName("month")
        .setDescription("The month of your birthday (1-12)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(12)
    )
    .addIntegerOption((option) =>
      option
        .setName("day")
        .setDescription("The day of your birthday (1-31)")
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(31)
    )
    .addIntegerOption((option) =>
      option
        .setName("year")
        .setDescription("The year of your birthday (optional)")
        .setRequired(false)
        .setMinValue(1900)
        .setMaxValue(new Date().getFullYear())
    ) as SlashCommandBuilder,
  cooldown: 60,

  autocomplete: async (interaction: AutocompleteInteraction) => {
    const focusedOption = interaction.options.getFocused(true);

    if (focusedOption.name === "month") {
      const months = [
        { name: "January", value: 1 },
        { name: "February", value: 2 },
        { name: "March", value: 3 },
        { name: "April", value: 4 },
        { name: "May", value: 5 },
        { name: "June", value: 6 },
        { name: "July", value: 7 },
        { name: "August", value: 8 },
        { name: "September", value: 9 },
        { name: "October", value: 10 },
        { name: "November", value: 11 },
        { name: "December", value: 12 },
      ];

      await interaction.respond(months);
    } else if (focusedOption.name === "day") {
      const days = Array.from({ length: 31 }, (_, i) => ({
        name: `${i + 1}`,
        value: i + 1,
      }));

      await interaction.respond(days);
    }
  },

  async execute(interaction: ChatInputCommandInteraction) {
    const monthValue = interaction.options.getInteger("month");
    const dayValue = interaction.options.getInteger("day");
    const yearValue = interaction.options.getInteger("year") || null;

    const [birthdayResponse, setBirthdayResponse] = await Promise.all([
      getRequest(
        `/guild/${interaction.guildId}/birthday/${interaction.user.id}`
      ),
      postRequest(
        `/guild/${interaction.guildId}/birthday/${interaction.user.id}`,
        {
          day: dayValue,
          month: monthValue,
          year: yearValue,
        }
      ),
    ]);

    if (setBirthdayResponse.code === ResponseCode.VALIDATION_ERROR) {
      safeReply(
        interaction,
        `Oops! ${setBirthdayResponse.message}. Please try again later.`
      );
      return;
    }

    if (
      setBirthdayResponse.code === ResponseCode.CREATED ||
      setBirthdayResponse.code === ResponseCode.SUCCESS
    ) {
      safeReply(interaction, "Your birthday has been successfully set!");
      return;
    }

    if (setBirthdayResponse.code === ResponseCode.FORBIDDEN) {
      safeReply(
        interaction,
        "Oops! You have already set your birthday twice and cannot set it again."
      );
      return;
    }

    safeReply(
      interaction,
      "Oops! Something went wrong. Please try again later."
    );
    return;
  },
};

export default command;
