import { Message, Events, Client } from 'discord.js';
import { askClaude } from '../services/claude';

import { splitMessage } from '../utils';

// Type for the execute function
export const name = Events.MessageCreate;

export async function execute(message: Message) {
    const client = message.client as Client;

    // Skip messages from bots to prevent potential loops
    if (message.author.bot) return;
    if (message.author.id != process.env.OWNER_ID) return;

    // Check if the message mentions the bot and the mention is at the start
    const mentionPrefix = new RegExp(`^<@!?${client.user?.id}>`);
    if (!mentionPrefix.test(message.content)) return;

    // Extract the actual query by removing the mention
    const query = message.content.replace(mentionPrefix, '').trim();
    if (!query) return;

    try {
        // Forward the query to Claude and let it handle the response
        await askClaude(query, message);
    } catch (error) {
        console.error('Error while processing Claude response:', error);
        await message.reply('Sorry, I encountered an error while processing your request.');
    }

}

