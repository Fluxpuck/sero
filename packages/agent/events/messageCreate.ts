import { Message, Events, Client } from 'discord.js';
import { askClaude } from '../services/claude';
import { UserResolver } from '../utils/user-resolver';

export const name = Events.MessageCreate;

export async function execute(message: Message) {
    const client = message.client as Client;

    try {
        // Skip messages from bots to prevent potential loops
        if (message.author.bot) return;

        // Skip forwarded messages
        if (message.webhookId) return;

        // Check if user is owner or has the specific role
        const accessRoles = process.env.ACCESS_ROLE_ID?.split(',') || [];
        const hasRole = accessRoles.some(roleId => message.member?.roles.cache.has(roleId));
        const isOwner = message.author.id === process.env.OWNER_ID;

        // Only allow specific users to interact with the bot
        // Based on owner and role permissions
        if (!isOwner && !hasRole) return;

        // Check if the message contains the word "flux" (case insensitive)
        // and notify the owner if it does
        if (/\b[fF]lux\w*\b/.test(message.content)) {
            if (!message.guild) return;

            const owner = await UserResolver.resolve(message.guild, `${process.env.OWNER_ID}`);
            if (!isOwner && owner) {
                await owner.send(`⚠️ You've been [mentioned](${message.url}) by ${message.author.tag}`);
            }
        }

        // Check if message mentions the bot at the start
        const mentionPrefix = new RegExp(`^<@!?${client.user?.id}>`);
        const isMention = mentionPrefix.test(message.content);

        // Additional conditions for Claude to respond
        const containsKeyword = /\b(hey sero|sero help|help sero)\b/i.test(message.content);
        const isReplyToBot = message.reference?.messageId &&
            (await message.channel.messages.fetch(message.reference.messageId))
                .author.id === client.user?.id;
        const isDirectMessage = message.channel.type === 1; // DM channel type is 1

        // Combine all conditions
        const shouldRespond = isMention || containsKeyword || isReplyToBot || isDirectMessage;
        if (!shouldRespond) return;

        // Extract query based on type of interaction
        let query = message.content;
        if (isMention) {
            query = message.content.replace(mentionPrefix, '').trim();
        } else if (containsKeyword) {
            // Remove the keyword trigger from the message
            query = message.content.replace(/\b(hey sero|sero help|sero,)\b/i, '').trim();
        }

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

