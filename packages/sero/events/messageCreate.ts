import { Message, Events, Client } from "discord.js";
import { Event } from "../types/client.types";

const event: Event = {
  name: Events.MessageCreate,
  once: false,
  async execute(message: Message): Promise<any> {
    const client = message.client as Client;

    // Skip empty messages or messages from bots
    if (!message || !message.content || message.author.bot) return;

    console.log("[Message]", {
      author: message.author.tag,
      content: message.content,
    });
  },
};

export default event;
