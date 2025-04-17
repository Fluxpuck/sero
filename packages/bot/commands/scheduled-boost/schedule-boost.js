const { ActionRowBuilder, ComponentType, MessageFlags } = require('discord.js');
const { deferInteraction, replyInteraction, updateInteraction } = require('../../utils/InteractionManager');
const { getRequest, postRequest, deleteRequest } = require("../../database/connection");
const ClientButtonsEnum = require("../../assets/embed-buttons");
const { createCustomEmbed } = require("../../assets/embed");
const { unixTimestamp, getNextOccurence } = require("../../lib/helpers/TimeDateHelpers/timeHelper")
const { chunk } = require("../../lib/helpers/MathHelpers/arrayHelper");

module.exports.props = {
    commandName: "schedule-boost",
    description: "Schedule a boost for the guild",
    usage: "/schedule-boost",
    interaction: {
        type: 1,
        options: [
            {
                name: "list",
                description: "List all scheduled boosts, if any, in an embed",
                type: 1, // Subcommand
            },
            {
                name: "add",
                description: "Add a new scheduled boost",
                type: 1,
                options: [
                    {
                        name: "name",
                        type: 3,
                        description: "The name of the scheduled boost",
                        required: true
                    },
                    {
                        name: "modifier",
                        type: 10,
                        description: "The amount to multiply the experience by",
                        required: true,
                        minValue: 0.5,
                        maxValue: 5
                    },
                    {
                        name: "duration",
                        type: 10,
                        description: "The duration of the boost in hours",
                        required: true,
                        minValue: 1,
                        maxValue: 120
                    },
                    {
                        name: "day",
                        type: 10,
                        description: "The day of the week to schedule the boost",
                        required: true,
                        choices: [
                            { name: "Sunday", value: 0 },
                            { name: "Monday", value: 1 },
                            { name: "Tuesday", value: 2 },
                            { name: "Wednesday", value: 3 },
                            { name: "Thursday", value: 4 },
                            { name: "Friday", value: 5 },
                            { name: "Saturday", value: 6 },
                        ]
                    },
                    {
                        name: "time",
                        type: 3,
                        description: "The time of day to schedule the boost (24 hour using bot is UTC)",
                        required: true
                    },
                    {
                        name: "repeat",
                        type: 5,
                        description: "Repeat the boost weekly",
                        required: false,
                    },
                    { // Fun idea to play with later, not needed for the base functionality
                        name: "event",
                        type: 3,
                        description: "The ID of an event to activate with the boost",
                        required: false,
                        autocomplete: true,
                    }
                ]
            },
            { // NOTE: Could be added to the functionality of the list subcommand
                name: "remove",
                description: "Remove a scheduled boost",
                type: 1,
                options: [
                    {
                        name: "boost",
                        type: 10,
                        description: "The ID of the scheduled boost to remove",
                        required: true,
                        autocomplete: true,
                    }
                    // Little QoL idea could be to add an option to remove only the next scheduled boost, not needed for the base functionality
                ]
            }
        ],
    },
    defaultMemberPermissions: ['ManageGuild']
}

module.exports.autocomplete = async (client, interaction) => {
    // Get the name of the subcommand used
    const autocomplete = interaction.options.getSubcommand();
    // Get the focused options value
    const focused = interaction.options.getFocused();
    // (true) is needed to get the name of the focused option
    const focusedName = interaction.options.getFocused(true).name;

    if (autocomplete === "add" && focusedName === "event") {
        const guildEvents = await interaction.guild.scheduledEvents.fetch().catch(() => null);
        if (!guildEvents) {
            return interaction.respond([]);
        }
        const guildEventsList = guildEvents.map((event) => {
            return {
                name: event.name,
                value: event.id,
            }
        })
        return interaction.respond(guildEventsList);
    }

    if (autocomplete === "remove" && focusedName === "boost") {
        // Request from the API to get all scheduled boosts, if any
        const scheduledBoostsListData = await getRequest(`/guilds/${interaction.guild.id}/boost/scheduled`);
        const scheduledBoostsList = scheduledBoostsListData.status === 200 ? scheduledBoostsListData.data : [];
        if (scheduledBoostsList.length === 0) {
            return interaction.respond([]);
        }
        // TODO (maybe not usefull) some filter for the input
        const scheduledBoostsListFormatted = scheduledBoostsList.map((boost) => {
            return {
                name: boost.boostName,
                value: boost.id,
            }
        })

        return interaction.respond(scheduledBoostsListFormatted);
    }
}

module.exports.run = async (client, interaction) => {
    switch (interaction.options.getSubcommand()) {
        case "list":
            // Also add reference time for the user to remind themselves what 01:00 UTC is in their timezone
            await deferInteraction(interaction, ephemeral = true);
            // Request from the API to get all scheduled boosts, if any
            let scheduledBoostsListData;
            try {
                scheduledBoostsListData = await getRequest(`/guilds/${interaction.guild.id}/boost/scheduled`);
            } catch (error) {
                console.error("Error while fetching scheduled boosts:", error);
                return replyInteraction(interaction, {
                    content: "An unexpected error occurred while fetching the scheduled boosts. Please try again later.",
                    flags: MessageFlags.Ephemeral,
                });
            }
            const scheduledBoostsList = scheduledBoostsListData.status === 200 ? scheduledBoostsListData.data : [];

            // Add eventName to the boost objects
            for (const boost of scheduledBoostsList) {
                if (boost.eventId) {
                    const guildEvent = await interaction.guild.scheduledEvents.fetch(boost.eventId).catch(() => null);
                    boost.eventName = guildEvent ? guildEvent.name : "Unknown Event";
                } else {
                    boost.eventName = "No Event";
                }
            }
            
            // Chunk the data (because max fields = 25, I think 3 per page will do nicely)
            const scheduledBoostsFormatted = scheduledBoostsList.map((boost) => {
                const eventName = boost.eventName
                const boostDate = getNextOccurence(boost.day, boost.time);
                const boostUnix = unixTimestamp(boostDate);
                const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]; // TODO: Move this to timeHelper?
                return {
                    name: `Boost: \`${boost.boostName}\``,
                    value: `Modifier - \`${boost.modifier}x\`\nDuration - \`${boost.duration} ${boost.duration > 1 ? "hours" : "hour"}\`\nDay - \`${daysOfWeek[boost.day]}\` which is ${boost.isBoostActive ? `\`today!\`` : `on <t:${boostUnix}:D>`}\nTime - \`${boost.time} (UTC)\` which is ${boost.isBoostActive ? `\`now!\`` : `<t:${boostUnix}:R>`}\nRepeat - \`${boost.repeat ? "Yes" : "No"}\`\nBoost status - \`${boost.isBoostActive ? "Active" : "Not active"}\`\nEvent - \`${eventName}\``,
                    inline: false,
                }
            });

            const scheduledBoostsChunks = chunk(scheduledBoostsFormatted, 3);
            let page = 0, maxpages = scheduledBoostsChunks.length - 1;

            let scheduledBoostsFields = scheduledBoostsFormatted.length == 0 ?
                [{ name: "No scheduled boosts", value: "There are no scheduled boosts for the guild.", inline: false }] :
                scheduledBoostsChunks[page];

            const description = (scheduledBoostsFormatted.length == 0) ? null : "Here are all the scheduled boosts for the guild.";

            const scheduledBoostsListEmbed = createCustomEmbed({
                title: "Scheduled Boosts",
                description: description,
                fields: [...scheduledBoostsFields],
                footer: {
                    text: `All times are in UTC as that is what the bots locale is. ${maxpages > 0 ? `\nPage ${page + 1} of ${maxpages + 1}` : ""}`
                },
            });

            const previousButton = ClientButtonsEnum.PREVIOUS_PAGE;
            previousButton.data.disabled = true;
            const nextButton = ClientButtonsEnum.NEXT_PAGE;
            nextButton.data.disabled = maxpages > 0 ? false : true;
            const scheduledBoostsListButtons = new ActionRowBuilder()
                .addComponents(
                    previousButton,
                    nextButton
                );

            const scheduledBoostsListMessage = await replyInteraction(interaction, {
                embeds: [scheduledBoostsListEmbed],
                components: scheduledBoostsChunks.length > 1 ? [scheduledBoostsListButtons] : null,
                flags: MessageFlags.Ephemeral,
            });

            if (scheduledBoostsChunks.length > 1) {

                // Collect the button selection
                const options = { componentType: ComponentType.Button, idle: 300_000, time: 3_600_000 }
                const scheduledBoostsListCollector = scheduledBoostsListMessage.createMessageComponentCollector({
                    options
                });

                scheduledBoostsListCollector.on("collect", async (button) => {
                    const selectedButton = button.customId;
                    if (selectedButton === "previous_pg" || selectedButton === "next_pg") {
                        // Update the page number based on the button pressed
                        if (selectedButton == 'previous_pg') {
                            if (page <= 0) {
                                page--;
                            }
                        } else if (selectedButton == 'next_pg') {
                            if (page >= maxpages) {
                                page++;
                            }
                        }

                        // Update the button status, based on the page number
                        const previousIndex = scheduledBoostsListButtons.components.findIndex(button => button.data.custom_id === "previous_pg");
                        const nextIndex = scheduledBoostsListButtons.components.findIndex(button => button.data.custom_id === "next_pg");
                        switch (page) {
                            case 0:
                                scheduledBoostsListButtons.components[nextIndex].data.disabled = false;
                                scheduledBoostsListButtons.components[previousIndex].data.disabled = true;
                                break;
                            case maxpages:
                                scheduledBoostsListButtons.components[nextIndex].data.disabled = true;
                                scheduledBoostsListButtons.components[previousIndex].data.disabled = false;
                                break;
                            default:
                                scheduledBoostsListButtons.components[nextIndex].data.disabled = false;
                                scheduledBoostsListButtons.components[previousIndex].data.disabled = false;
                        }

                        // Update embed Footer && Fields
                        scheduledBoostsListEmbed.setFooter({ text: `All times are in UTC as that is what the bots locale is.\nPage ${page + 1} of ${maxpages + 1}` });
                        scheduledBoostsListEmbed.data.fields = []; // Empty current fields
                        scheduledBoostsListEmbed.addFields(
                            ...scheduledBoostsChunks[page]
                        );

                        // Update the interaction
                        await updateInteraction(button, {
                            embeds: [scheduledBoostsListEmbed],
                            components: [scheduledBoostsListButtons]
                        })
                    }
                });
            }
            break;
        case "add":
            // Get the parameters from the interaction
            const boostName = interaction.options.getString("name");
            const modifier = interaction.options.getNumber("modifier");
            const duration = interaction.options.getNumber("duration");
            const day = interaction.options.getNumber("day");
            const time = interaction.options.getString("time");
            const repeat = interaction.options.getBoolean("repeat") || false;
            const eventId = interaction.options.getString("event") || null;
            // Validate the parameters
            // - Time: Check string input is valid
            // - Check that the event ID is valid
            const isTimeValid = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
            if (!isTimeValid) {
                return replyInteraction(interaction, {
                    content: "The time input is invalid. Please use the 24-hour format (e.g. 03:54).",
                    flags: MessageFlags.Ephemeral,
                });
            }
            // Check that event exists for the current guild
            if (eventId) {
                const guildEvents = await interaction.guild.scheduledEvents.fetch(eventId).catch(() => null);
                if (!guildEvents) {
                    return replyInteraction(interaction, {
                        content: "The event ID is invalid. Please provide a valid event ID.",
                        flags: MessageFlags.Ephemeral,
                    });
                }
            }

            // API request to add the scheduled boosts
            const guildId = interaction.guild.id;
            try {
                const created = await postRequest(`/guilds/${interaction.guild.id}/boost/scheduled`, {
                    guildId, boostName, modifier, duration, day, time, repeat, eventId,
                });
                if (created.status === 200) {
                    return replyInteraction(interaction, {
                        content: "The scheduled boost has been added.",
                        flags: MessageFlags.Ephemeral,
                    });
                } else {
                    return replyInteraction(interaction, {
                        content: "An error occurred while adding the scheduled boost. Boost not scheduled.",
                        flags: MessageFlags.Ephemeral,
                    });
                }
            } catch (error) {
                console.error("Error while adding the scheduled boost:", error);
                return replyInteraction(interaction, {
                    content: "An unexpected error occurred while adding the scheduled boost. Please try again later.",
                    flags: MessageFlags.Ephemeral,
                });
            }
        case "remove":
            // Get the parameters from the interaction
            const boostId = interaction.options.getNumber("boost");
            // API request to remove the scheduled boost
            try {
                const removed = await deleteRequest(`/guilds/${interaction.guild.id}/boost/scheduled/${boostId}`);
                if (removed.status === 200) {
                    return replyInteraction(interaction, {
                        content: "The scheduled boost has been removed.",
                        flags: MessageFlags.Ephemeral,
                    });
                } else {
                    return replyInteraction(interaction, {
                        content: "An error occurred while removing the scheduled boost. Boost not removed.\nAre you sure you gave a correct ID?",
                        flags: MessageFlags.Ephemeral,
                    });
                }
            } catch (error) {
                console.error("Error while removing the scheduled boost:", error);
                return replyInteraction(interaction, {
                    content: "An unexpected error occurred while removing the scheduled boost. Please try again later.",
                    flags: MessageFlags.Ephemeral,
                });
            }
            break;
        default:
            return replyInteraction(interaction, {
                content: `This wasn't supposed to happen, what could you have done...`,
                flags: MessageFlags.Ephemeral,
            });
            break;
    }
}