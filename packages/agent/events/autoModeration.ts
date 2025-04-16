import { Message, Client } from 'discord.js';
import { ClaudeService } from '../services/claude';

// Message batching map to store recent messages by user
const userMessageMap = new Map<string, Message[]>();
const MAX_BATCH_SIZE = 5; // Maximum number of messages to batch before processing
const DEBOUNCE_TIMEOUT = 8000; // 8 seconds debounce timeout
const batchTimeouts = new Map<string, NodeJS.Timeout>();

export const name = 'AutoModeration' as const;
export async function execute(message: Message) {
    // Check if the message has a guild, is from a bot, or if the member is not moderatable
    if (!message.guild || message.author.bot) return;

    if (message.channel.id != "1039958236595494962") return;

    // Create a unique key based on user ID
    const userKey = message.author.id;

    // Get or create message batch for this user
    const userMessages = userMessageMap.get(userKey) || [];

    // Add current message to the batch
    userMessages.push(message);
    userMessageMap.set(userKey, userMessages);

    // Clear any existing timeout for this user
    if (batchTimeouts.has(userKey)) {
        clearTimeout(batchTimeouts.get(userKey));
    }

    // Process messages immediately if we hit the batch size limit
    if (userMessages.length >= MAX_BATCH_SIZE) {
        processUserMessages(userKey);
    } else {
        // Otherwise set a debounce timeout to process after delay
        const timeout = setTimeout(() => {
            processUserMessages(userKey);
        }, DEBOUNCE_TIMEOUT);

        batchTimeouts.set(userKey, timeout);
    }
}

async function processUserMessages(userKey: string) {
    try {
        const messages = userMessageMap.get(userKey);
        if (!messages || messages.length === 0) return;

        // Get the last message as the reference for the check
        const lastMessage = messages[messages.length - 1];

        // Create an instance
        const claudeService = new ClaudeService();

        // Send the messages through the Claude service for moderation
        await claudeService.checkViolation(lastMessage, messages);

        // Clear the processed messages
        userMessageMap.delete(userKey);
        batchTimeouts.delete(userKey);
    } catch (error) {
        console.error('Error in autoModeration processing messages:', error);
    }
}
