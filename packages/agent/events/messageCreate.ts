import { Message, Events, Client } from 'discord.js';
import { ClaudeService } from '../services/claude';
import useApi from '../hooks/useApi';
import { ResponseStatus } from '../types/api.types';

export const name = Events.MessageCreate;
export async function execute(message: Message) {
    const client = message.client as Client;

    // Skip empty messages or messages from bots 
    if (!message || !message.content || message.author.bot) return;

    try {
        // Create service instance
        const claudeService = new ClaudeService();

        // Check user permissions to use the bot
        const allowedRoleIds = process.env.ACCESS_ROLE_ID?.split(',') || [];
        const hasAllowedRole = allowedRoleIds.some(roleId => message.member?.roles.cache.has(roleId));
        const isOwner = client.ownerId === message.author.id;

        // Exit if user lacks permission
        if (!isOwner && !hasAllowedRole) return;

        /**
         * @TESTING PURPOSES ONLY
         * This block is for testing the API endpoint locally.
         */
        if (isOwner && message.content.includes('test-api')) {
            try {
                // Use the API hook instead of direct fetch
                const api = useApi();
                const response = await api.get('/guild/' + message.guildId);

                if (response.status === ResponseStatus.SUCCESS) {
                    console.log('Fetched from API:', response.data);
                } else {
                    console.error('API error:', response.message);
                }
            } catch (error) {
                console.error('Error fetching from API:', error);
            }
        }

        // Check if this message is for the bot
        const isMention = message.mentions.has(client.user?.id || '');
        const isKeywordTrigger = /\b(hello sero|hey sero)\b/i.test(message.content);
        const isDM = message.channel.type === 1;

        // Check if message is a reply to bot
        let isReplyToBot = false;
        if (message.reference?.messageId) {
            try {
                const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);
                isReplyToBot = referencedMessage.author.id === client.user?.id;
            } catch (error) {
                console.error('Error checking if message is a reply to bot:', error);
            }
        }

        // Exit if not addressed to the bot
        if (!(isMention || isKeywordTrigger || isReplyToBot || isDM)) return;

        // Extract prompt, removing mention or trigger words if present
        let prompt = message.content;

        // Remove bot mention from the prompt if present
        if (isMention && client.user) {
            const mentionRegex = new RegExp(`<@!?${client.user.id}>`, 'g');
            prompt = prompt.replace(mentionRegex, '').trim();
        }

        // Remove trigger words if present
        if (isKeywordTrigger) {
            prompt = prompt.replace(/\b(hello sero|hey sero)\b/i, '').trim();
        }

        // Add context from referenced message if this is a reply
        let referencedContent = "";
        if (message.reference?.messageId) {
            try {
                const referencedMessage = await message.channel.messages.fetch(message.reference.messageId);
                if (referencedMessage) {
                    // Format who the message is from
                    const referencedAuthor = referencedMessage.author.bot ?
                        (referencedMessage.author.id === client.user?.id ? "you" : "another bot") :
                        `user ${referencedMessage.author.username}`;

                    referencedContent = `\n\nI'm replying to this message from ${referencedAuthor}:\n"${referencedMessage.content}"\n\n`;

                    // Prepend referenced message to the prompt for better context
                    prompt = referencedContent + prompt;
                }
            } catch (error) {
                console.error('Error fetching referenced message:', error);
            }
        }

        // Set default prompt if empty after processing
        if (!prompt.trim() || prompt === referencedContent) {
            prompt = "Hello, how can I help you?";
        }

        // Execute Claude service with the prompt
        claudeService.askClaude(prompt, message);

    } catch (error) {
        console.error('Error in messageCreate:', error);
    }
}