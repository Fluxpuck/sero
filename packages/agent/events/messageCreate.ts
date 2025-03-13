import { Events, Message, Client, ChannelType } from 'discord.js';
import { askClaude } from '../services/claude';
import { getChannelName } from '../utils';

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
    console.log(`Received query: ${query}`);

    // If there's no query after the mention, ignore
    if (!query) return;

    try {
        // Create the context objects
        const guild = {
            guildId: message.guild?.id ?? 'DM',
            guildName: message.guild?.name ?? 'Direct Message'
        };

        const channel = {
            channelId: message.channel.id,
            channelName: getChannelName(message.channel)
        };

        const user = {
            userId: message.author.id,
            username: message.author.username
        };

        // Call Claude API with the context
        const response = await askClaude(guild, channel, user, query);

        // Handle Discord's message length limits (2000 characters)
        if (response.length <= 2000) {
            await message.reply(response);
        } else {
            // Split long responses
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

// Helper function to split messages that exceed Discord's character limit
function splitMessage(text: string, maxLength = 2000): string[] {
    const chunks: string[] = [];
    let currentChunk = '';

    const lines = text.split('\n');

    for (const line of lines) {
        // If adding this line would exceed the limit, push the current chunk and start a new one
        if (currentChunk.length + line.length + 1 > maxLength) {
            chunks.push(currentChunk);
            currentChunk = line + '\n';
        } else {
            currentChunk += line + '\n';
        }
    }

    // Don't forget the last chunk
    if (currentChunk) {
        chunks.push(currentChunk);
    }

    return chunks;
}