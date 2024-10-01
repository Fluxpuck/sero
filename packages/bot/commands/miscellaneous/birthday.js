// Simple command to set your birthday
// Format: `/birthday [day] [month] (year)`
// Make a preliminary check for the user for them to double-check their input
// If the user confirms, set the birthday in the database using a new route If the user denies or doesn't respond, cancel the command
// The user can also readd their birthday using the same command, however they can only change it once (a year?)
// If user is too young for discord, log the incident as a warning and cancel the command
const { ActionRowBuilder } = require("discord.js");
const { monthOptions, dayPossibilities } = require("../../assets/date-options");
const { createCustomEmbed } = require("../../assets/embed");
const ClientButtonsEnum = require("../../assets/embed-buttons");
const ClientEmbedColors = require("../../assets/embed-colors");
const { getRequest, postRequest } = require("../../database/connection");
const { getYearsAgo } = require("../../lib/helpers/TimeDateHelpers/timeHelper");

module.exports.props = {
    commandName: "birthday",
    description: "Set a birthday for yourself, optionally include your birth year",
    usage: "/birthday [month] [day] (year)",
    interaction: {
        type: 1,
        options: [
            {
                name: "month",
                description: "The month of your birthday",
                type: 4,
                required: true,
                choices: Object.entries(monthOptions).map(([key, value]) => ({
                    name: value,
                    value: key,
                })),
            },
            {
                name: "day",
                description: "The day of your birthday",
                type: 4,
                required: true,
                minValue: 1,
                maxValue: 31,
            },
            {
                name: "year",
                description: "The year of your birthday",
                type: 4,
                required: false,
                minValue: 1900, // Latest year possible with systems
                maxValue: new Date().getFullYear(), // This year (calculated at runtime once, will need a bot restart to update but not really an issue)
            },
        ],
    },
    defaultMemberPermissions: ["SendMessages"],
    cooldown: 2 * 60, // 2 minutes
};

module.exports.run = async (client, interaction) => {
    // Defer the reply to prevent timeout while processing
    await interaction.deferReply({ ephemeral: true });

    // Check if the user has already set their birthday (limit to 2 times)
    const existingResult = await getRequest(`guilds/${interaction.guildId}/birthday/${interaction.user.id}`);
    const { birthdayAt: birthdayAtString, createdAt, updatedAt } = existingResult?.data || {};
    const birthdayAt = birthdayAtString ? new Date(birthdayAtString) : null;

    if (existingResult?.status === 200 && birthdayAt) {
        if (updatedAt > createdAt) {
            // Genius way to check if the user has set their birthday twice :)
            const existingAge = birthdayAt - new Date();
            return interaction.editReply({
                content:
                    "You have already set your birthday twice. You cannot set it again.\n" +
                    `Your birthday is currently set to \`${
                        monthOptions[birthdayAt.getMonth() + 1]
                    } ${birthdayAt.getDate()}${
                        birthdayAt.getFullYear() && getYearsAgo(birthdayAt) >= 13 ? `, ${birthdayAt.getFullYear()}` : ""
                    }\`.\n` +
                    "-# If you need to correct it, please contact a staff member.",
                ephemeral: true,
            });
        }
    }

    // Get the user's input
    const month = interaction.options.get("month").value;
    const day = interaction.options.get("day").value;
    const year = interaction.options.get("year")?.value;

    // Check that the day is valid for the month
    if (day > dayPossibilities[month] || day < 1) {
        return interaction.editReply({
            content: `The month of ${monthOptions[month]} does not have ${day} days.`,
            ephemeral: true,
        });
    }

    // Make a date object and if a year is provided, calculate the user's age
    const birthdate = new Date(year || new Date().getFullYear(), month - 1, day);
    const age = year ? getYearsAgo(birthdate) : null;

    // Confirm the user's input
    const confirmationEmbed = createCustomEmbed({
        color: ClientEmbedColors.LIGHT_BLUE,
        title: "Birthday Confirmation",
        description:
            "Please confirm your birthday details:\n" +
            `**Date:** \`${monthOptions[month]} ${day}${year ? `, ${year}` : ""}\`\n` +
            `${year ? `**Age:** \`${age} years old\`\n` : ""}` +
            `${
                birthdayAt
                    ? `Note: Your current birthday is set to \`${
                          monthOptions[birthdayAt.getMonth() + 1]
                      } ${birthdayAt.getDate()}${
                          birthdayAt.getFullYear() && getYearsAgo(birthdayAt) >= 13
                              ? `, ${birthdayAt.getFullYear()}`
                              : ""
                      }\`\n`
                    : ""
            }`,
        footer: {
            text: "You can only set your birthday twice: once for setting and once for correcting.\nThis command will time out in 15 seconds.",
            // Maybe nice to have a warning image here, to draw attention
        },
    });

    const confirmationComponents = new ActionRowBuilder().addComponents(
        ClientButtonsEnum.AGREE,
        ClientButtonsEnum.CANCEL,
    );

    const message = await interaction.editReply({
        embeds: [confirmationEmbed],
        components: [confirmationComponents],
        ephemeral: true,
    });

    try {
        confirm = await message.awaitMessageComponent({ time: 20_000 });
    } catch (error) {
        // If the user doesn't respond in time, cancel the command
        return interaction.editReply({
            content: "Command timed out. Your birthday has not been set.",
            embeds: [],
            components: [],
        });
    }

    // If the user doesn't agree/confirm, cancel the command
    if (confirm.customId !== "agree") {
        return confirm.update({
            content: "Your birthday has not been set.",
            embeds: [],
            components: [],
        });
    }

    // Check if the user is under 13, if they provide a year (Discord TOS) (maybe even log it)
    if (year && age < 13) {
        // TODO: Log the incident

        // Inform the user and cancel the command
        return confirm.update({
            content: "You cannot set your birthday with that age.", // Was: "You are under the age of 13, you cannot set your birthday."
            embeds: [],
            components: [],
        });
    }

    await confirm.deferUpdate();
    // Set the birthday in the database (probably good idea to put this in a try catch)
    const result = await postRequest(`guilds/${interaction.guildId}/birthday/${interaction.user.id}`, {
        birthdayAt: birthdate,
    });

    if (result?.status !== 200) {
        return confirm.editReply({
            content: "Something went wrong while setting your birthday. It has not been set.",
            embeds: [],
            components: [],
        });
    }

    // Send a new message to the channel, pinging the user with their new set birthday
    await interaction.channel.send({
        content: `${interaction.user}'s birthday has been set to ${monthOptions[month]} ${day}${
            year ? `, ${year}` : ""
        }.`,
    });

    // Return confirmation message to the user
    return confirm.editReply({
        content: "Your birthday has been successfully set.",
        embeds: [],
        components: [],
    });
};
