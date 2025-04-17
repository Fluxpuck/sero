import { Message, Collection, PermissionFlagsBits } from 'discord.js';
import { ClaudeService } from '../services/claude';
import { MessageViolationCheckInput } from '../types/message.types';

export const name = 'AutoModeration' as const;

// Create a message collection for each user
const userMessages = new Map<string, Collection<string, Message>>();
const userTimeouts = new Map<string, NodeJS.Timeout>();

// Create a claude service instance
const claudeService = new ClaudeService();

// Time threshold in milliseconds (10 seconds)
const TIME_THRESHOLD = 10_000;
const MESSAGE_THRESHOLD = 10;

export async function execute(message: Message) {
    // Check if auto moderation is enabled
    if (process.env.AUTO_MODERATION_ENABLED !== 'true') return;

    // Check if the message has a guild, is from a bot, or if the member is not moderatable
    if (!message.guild || message.author.bot || !message.member?.moderatable) return;
    if (message.member.permissions.has(PermissionFlagsBits.ManageMessages)) return;

    // Exclude auto moderation for certain roles
    const excludeAutoModerationRoles = process.env.EXCLUDE_AUTO_MODERATION_ROLES?.split(',') || [];
    const hasExcludedRole = message.member.roles.cache.some(role => excludeAutoModerationRoles.includes(role.id));
    if (hasExcludedRole) return;

    // Only moderate on these channels
    const moderateChannelIds = process.env.AUTO_MODERATION_CHANNELS?.split(',') || [];
    const isAutoModerationChannel = moderateChannelIds.some(channelId => message.channel.id === channelId);
    if (!isAutoModerationChannel) return;

    // Get or create message collection for this user
    const userId = message.author.id;
    if (!userMessages.has(userId)) {
        userMessages.set(userId, new Collection<string, Message>());

        // Set timeout for this user (15 seconds)
        const timeout = setTimeout(async () => {
            const messages = userMessages.get(userId);
            if (messages && messages.size > 0) {
                // Time's up - check for violations
                await processViolation(message, userId);
            }
        }, TIME_THRESHOLD);

        // Store the timeout ID
        userTimeouts.set(userId, timeout);
    }

    // Add the message to the user's collection
    const messages = userMessages.get(userId)!;
    messages.set(message.id, message);

    // Check if we've reached the message threshold
    if (messages.size >= MESSAGE_THRESHOLD) {
        await processViolation(message, userId);
    }
}

// Helper function to process violations and clean up
async function processViolation(message: Message, userId: string) {
    try {
        // Get the user's messages
        const messages = userMessages.get(userId);
        if (!messages) return;

        // Format messages according to MessageViolationCheckInput type
        const messageContents = messages.map(msg => msg.content);
        const violationCheckInput: MessageViolationCheckInput = {
            userId: userId,
            messages: messageContents.join('\n')
        };

        // Check for violations
        await claudeService.checkViolation(message, violationCheckInput);
    } catch (error) {
        console.error('Error in auto-moderation:', error);
    } finally {
        // Clear the timeout if it exists
        const timeout = userTimeouts.get(userId);
        if (timeout) {
            clearTimeout(timeout);
            userTimeouts.delete(userId);
        }

        // Clear the message collection
        userMessages.delete(userId);
    }
}
