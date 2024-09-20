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
    cooldown: 2 * 60 // 2 minutes
};

module.exports.run = async (client, interaction) => {
    // Defer the reply to prevent timeout while processing
    await interaction.deferReply({ ephemeral: true });

    // Check if the user has already set their birthday (limit to 2 times)
    // const userBirthday = await client.db.getBirthday(interaction.user.id);
    // if (userBirthday) {
    //     // Do some other checks here (like how many times they've set their birthday)
    // }

    // Get the user's input
    const month = interaction.options.get("month").value;
    const day = interaction.options.get("day").value;
    const year = interaction.options.get("year")?.value;
    const age = year ? new Date().getFullYear() - year : null;

    // Check that the day is valid for the month
    if (day > dayPossibilities[month] || day < 1) {
        return interaction.editReply({
            content: `The month of ${monthOptions[month]} does not have ${day} days.`,
            ephemeral: true,
        });
    }

    // Confirm the user's input
    const confirmationEmbed = createCustomEmbed({
        color: ClientEmbedColors.BLUE,
        title: "Birthday Confirmation",
        description: `
            Are you sure you want to set your birthday to ${monthOptions[month]} ${day}${year ? `, ${year}.` : ""} 
            ${year ? `That would make you ${age} years old.\n` : ""}
            Careful, you can only set your birthday twice: 
            once for setting and once for correcting.
        `,
        footer: {
            text: "This command will time out in 15 seconds.",
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
            content: "You are under the age of 13, you cannot set your birthday.",
            embeds: [],
            components: [],
        });
    }

    // Set the birthday in the database (probably good idea to put this in a try catch)
    // await client.db.setBirthday(interaction.user.id, { day, month, year });
    console.log("send to database", { day, month, year });

    // Return confirmation message
    return confirm.update({
        content: `Your birthday has been set to ${monthOptions[month]} ${day}${year ? `, ${year}` : ""}.`,
        embeds: [],
        components: [],
        ephemeral: false, // I would like for the message to be public, but we'd have to send a follow-up message to the channel
    });
};
