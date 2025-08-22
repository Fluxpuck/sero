import { Message, Events, Client } from "discord.js";

export const name = Events.MessageCreate;
export async function execute(message: Message) {
  const client = message.client as Client;

  // Skip empty messages or messages from bots
  if (!message || !message.content || message.author.bot) return;
}
