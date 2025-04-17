const { createCustomEmbed } = require("../assets/embed");
const ClientEmbedColors = require("../assets/embed-colors");
const { getRequest } = require("../database/connection");

module.exports = async (client, payload) => {
    if (!payload.hasOwnProperty('status')) return; // Make sure it has a status first
    if (payload.status == 'start') {
        const requiredAttributes = ['guildId', 'boostName', 'modifier', 'duration', 'repeat', 'channelId'];
        for (const attribute of requiredAttributes) {
            if (!payload.hasOwnProperty(attribute)) return;
        }

        try {
            // Send a message to the channel (channelId if exists) and note the modifier and duration
            const guild = await client.guilds.fetch(payload.guildId);
            const channel = await guild.channels.fetch(payload.channelId);
            if (channel) {
                const messageEmbed = createCustomEmbed({
                    title: `🚀 Scheduled Boost 🚀`,
                    description: `Started the scheduled boost "${payload.boostName}"\nBoosting at ${payload.modifier}x for ${payload.duration} ${payload.duration > 1 ? `hours` : `hour`}, enjoy!`,
                    footer: payload.repeat ? 'This boost will repeat weekly' : null,
                    color: ClientEmbedColors.GREEN,
                });

                const sentMessage = await channel.send({
                    embeds: [messageEmbed],
                });
            }

            // If eventId is given, attempt to start the event
            if (payload.eventId) {
                const event = await guild.scheduledEvents.fetch(payload.eventId);
                // Source https://discord.js.org/docs/packages/discord.js/14.18.0/GuildScheduledEvent:Class#edit
                // event.edit() has one parameter called options, thus can be omitted
                event.edit({
                    status: 2 // 2 = active
                })
            }
        } catch (err) {
            console.log('Error:', err);
        };

    } else if (payload.status == 'end') {
        const requiredAttributes = ['guildId', 'boostName', 'channelId'];
        for (const attribute of requiredAttributes) {
            if (!payload.hasOwnProperty(attribute)) return;
        }

        try {
            // Send a message to the channel (channelId) and note the modifier and durarion
            const guild = await client.guilds.fetch(payload.guildId);
            const channel = await guild.channels.fetch(payload.channelId);
            if (channel) {
                const messageEmbed = createCustomEmbed({
                    title: `🚀 Scheduled Boost 🚀`,
                    description: `Scheduled boost "${payload.boostName}" has ended, hope you enjoyed!`,
                    color: ClientEmbedColors.RED,
                });

                const sentMessage = await channel.send({
                    embeds: [messageEmbed],
                });
            }

            // If eventId is given, attempt to end the event
            if (payload.eventId) {
                const event = await guild.scheduledEvents.fetch(payload.eventId);
                // Source https://discord.js.org/docs/packages/discord.js/14.18.0/GuildScheduledEvent:Class#edit
                // event.edit() has one parameter called options, thus can be omitted
                event.edit({
                    status: 3 // 3 = completed (should reschedule or end)
                }).catch(() => null);
            }
        } catch (err) {
            console.log('Error:', err);
        };
    }

}