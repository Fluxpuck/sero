"use strict";
// events/ready.ts
const discord_js_1 = require("discord.js");
const event = {
    name: discord_js_1.Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`✅ Ready! Logged in as ${client.user?.tag}`);
        console.log(`🤖 Serving in ${client.guilds.cache.size} guilds`);
        console.log(`⌛ Started at: ${new Date().toLocaleString()}`);
        // Set presence (optional)
        client.user?.setPresence({
            activities: [{ name: '/help', type: 3 }], // 3 = Watching
            status: 'online'
        });
    },
};
module.exports = event;
