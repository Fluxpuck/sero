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

    console.log(`Received query: ${query}`);

    try {

        const response = await askClaude(query, message);

        // Handle Discord's message length limits (2000 characters)
        // If the response is short enough, send it as a single message
        // Otherwise, split it into chunks
        if (response.length < 2_000) {
            await message.reply(response);
        } else {
            const chunks = splitMessage(response);
            for (const chunk of chunks) {
                await message.reply(chunk);
            }
        }

    } catch (error) {
        console.error('Error while processing Claude response:', error);
        await message.reply('Sorry, I encountered an error while processing your request.');

    }

}

