import { Message, Events, Client } from "discord.js";
import { Event } from "../types/client.types";
import { logger } from "../utils/logger";

const event: Event = {
  name: Events.MessageCreate,
  once: false,
  async execute(message: Message): Promise<any> {
    const client = message.client as Client;

    // Skip empty messages or messages from bots
    if (!message || !message.content || message.author.bot) return;

    logger.debug(`Message from ${message.author.tag}: ${message.content}`);
  },
};

export default event;
