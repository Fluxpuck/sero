import { Message, Events, Client } from 'discord.js';
import { askClaude } from '../services/claude';

export const name = Events.MessageCreate;

export async function execute(message: Message) {
    const client = message.client as Client;

    try {
        // Skip messages from bots to prevent potential loops
        if (message.author.bot) return;

        // Check if user is owner or has the specific role
        const accessRoles = process.env.ACCESS_ROLE_ID?.split(',') || [];
        const hasRole = accessRoles.some(roleId => message.member?.roles.cache.has(roleId));
        if (message.author.id !== process.env.OWNER_ID || !hasRole) return;

        // Check if message mentions the bot at the start or is a reply to the bot
        const mentionPrefix = new RegExp(`^<@!?${client.user?.id}>`);
        const isMention = mentionPrefix.test(message.content);
        const referencedMessage = message.reference?.messageId
            ? await message.channel.messages.fetch(message.reference.messageId)
            : null;
        const isReply = referencedMessage?.author.id === client.user?.id;

        if (!isMention && !isReply) return;

        // Extract query - handle both mentions and replies
        let query = isMention
            ? message.content.replace(mentionPrefix, '').trim()
            : message.content.trim();

        if (!query) {
            await message.reply('Please provide a message for me to respond to.');
            return;
        }

        // Forward the query to Claude
        await askClaude(query, message);

    } catch (error) {
        console.error('Error in messageCreate:', error);
        await message.reply('Sorry, I encountered an error while processing your request. Please try again later.');
    }
}

