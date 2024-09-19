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
const embed = require("../../assets/embed");

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
                type: 3,
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
            },
        ],
    },
    defaultMemberPermissions: ["SendMessages"],
};

module.exports.run = async (client, interaction) => {
    // Defer the reply to prevent timeout while processing
    await interaction.deferReply({ ephemeral: true });

    // Get the user's input
    const month = interaction.options.get("month").value; // This is automatically going to be correct
    const day = interaction.options.get("day").value; // This can possibly be incorrect due to the month
    const year = interaction.options.get("year")?.value; // This is optional

    // // Check if the user is under 13, if they provide a year  (Discord TOS) (maybe even log it)
    // if (year && new Date().getFullYear() - year < 13) {
    //     return interaction.editReply({
    //         content: "You are under the age of 13, you cannot set your birthday.",
    //         ephemeral: true,
    //     });
    // }

    // Format the date
    // Check that the day is valid for the month
    if (day > dayPossibilities[month]) {
        return interaction.editReply({
            content: `The month of ${monthOptions[month]} does not have ${day} days.`,
            ephemeral: true,
        });
    }

    // Confirm the user's input
    const confirmationEmbed = createCustomEmbed({
        color: ClientEmbedColors.BLUE,
        title: "Birthday Confirmation",
        description: `Are you sure you want to set your birthday to ${monthOptions[month]} ${day}${
            year ? `, ${year}` : ""
        }?`,
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

    let confirm;
    try {
        confirm = await message.awaitMessageComponent({
            filter: i => i.user.id === interaction.user.id,
            time: 15_000,
        });
    } catch (error) {
        // If the user doesn't respond in time, cancel the command
        return interaction.editReply({
            content: "Command timed out. Your birthday has not been set.",
            embeds: [],
            components: [],
            ephemeral: true,
        });
    }

    // If the user confirms, set the birthday
    if (confirm.customId === "agree") {
        // Set the birthday in the database
        // await client.db.setBirthday(interaction.user.id, { day, month, ?year });
        console.log("send to database", { day, month, year });

        // Return confirmation message
        return confirm.update({
            content: `Your birthday has been set to ${monthOptions[month]} ${day}${year ? `, ${year}` : ""}.`,
            embeds: [],
            components: [],
            ephemeral: false,
        });
    } else {
        // If the user denies, cancel the command
        return confirm.update({
            content: "Your birthday has not been set.",
            embeds: [],
            components: [],
            ephemeral: true,
        });
    }
};
