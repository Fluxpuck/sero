import { Events, Client } from "discord.js";
import { Event } from "../types/client.types";

const event: Event = {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client) {
    console.log("|");
    console.log(`✅ Logged in as ${client.user?.tag}`);
    console.log(`🤖 Serving in ${client.guilds.cache.size} guilds`);
    console.log(`⌛ Started at ${new Date().toLocaleString()}`);

    client.user?.setPresence({
      activities: [{ name: "🤖", type: 4 }],
      status: "online",
    });
  },
};

export = event;
