import { Message, Events, Client } from 'discord.js';
import { ClaudeService } from '../services/claude';

export const name = Events.MessageCreate;
export async function execute(message: Message) {
    const client = message.client as Client;

    // Create an instance
    const claudeService = new ClaudeService();

    try {
        // Skip forwarded messages
        // Skip messages from bots to prevent potential loops
        if (!message || !message.content) return;
        if (message.author.bot) return;

        // Run the message mention event
        client.emit('MessageMention', message);

        // Check user permissions to use the bot
        const allowedRoleIds = process.env.ACCESS_ROLE_ID?.split(',') || [];
        const hasAllowedRole = allowedRoleIds.some(roleId => message.member?.roles.cache.has(roleId));
        const isOwner = client.ownerId === message.author.id;

        // Exit if user lacks permission
        if (!isOwner && !hasAllowedRole) return;

        // Check if this message is for the bot
        const isMention = message.mentions.has(client.user?.id || '');
        const isKeywordTrigger = /\b(hey sero|sero help|help sero)\b/i.test(message.content);
        const isReplyToBot = message.reference?.messageId &&
            (await message.channel.messages.fetch(message.reference.messageId))
                .author.id === client.user?.id;
        const isDM = message.channel.type === 1;

        // Exit if not addressed to the bot
        if (!(isMention || isKeywordTrigger || isReplyToBot || isDM)) return;

        // Extract prompt, removing mention or trigger words if present
        let prompt = message.content;
        if (isMention) prompt = prompt.replace(/^<@!?\d+>\s*/, '').trim();
        else if (isKeywordTrigger) prompt = prompt.replace(/\b(hey sero|sero help|help sero)\b/i, '').trim();

        // Ensure we have content to respond to
        if (!prompt) {
            await message.reply('Please provide a message for me to respond to.');
            return;
        }

        // Send the prompt to Claude for reasoning
        await claudeService.reasoning(prompt, message);

    } catch (error) {
        console.error('Error in messageCreate:', error);
        await message.reply('Sorry, I encountered an error while processing your request. Please try again later.');
    }
}
