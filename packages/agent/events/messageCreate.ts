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

        if (!isMention) return;

        // Extract query from mention
        let query = message.content.replace(mentionPrefix, '').trim();

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

