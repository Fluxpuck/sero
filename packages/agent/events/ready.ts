// events/ready.ts
import { Events, Client } from 'discord.js';
import { Event } from '../types/event.types';

const event: Event = {
    name: Events.ClientReady,
    once: true,
    execute(client: Client) {
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

export = event;