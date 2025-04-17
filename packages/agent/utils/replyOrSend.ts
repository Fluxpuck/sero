import { Message, MessageCreateOptions, MessagePayload } from 'discord.js';

/**
 * Type representing valid message content for Discord messages
 */
type MessageContent = string | MessagePayload | MessageCreateOptions;

/**
 * Replies to a message, and if replying fails, sends a message in the channel.
 * @param message - The original message to reply to.
 * @param content - The content of the reply or message.
 * @returns A Promise resolving to true if successful, false if both methods fail.
 */
export async function replyOrSend(message: Message, content: MessageContent): Promise<void> {
    // Check if content is empty string and handle appropriately
    if (typeof content === 'string' && content.trim() === '') {
        throw new Error('Attempted to send empty message, skipping');
    }

    // Check if content object has empty content property
    if (typeof content === 'object' && 'content' in content &&
        typeof content.content === 'string' && content.content.trim() === '') {
        throw new Error('Attempted to send message with empty content, skipping');
    }

    try {
        await replyToMessage(message, content);
    } catch (error) {
        await sendInChannel(message, content);
    }
}

/**
 * Replies to a message.
 * @param message - The original message to reply to.
 * @param content - The content of the reply.
 */
async function replyToMessage(message: Message, content: MessageContent): Promise<void> {
    if (!message.channel) {
        throw new Error('Message channel is undefined');
    }

    await message.reply(content);
}

/**
 * Sends a message in the channel.
 * @param message - The original message to determine the channel.
 * @param content - The content of the message.
 */
async function sendInChannel(message: Message, content: MessageContent): Promise<void> {
    const channel = message.channel;

    if (!channel) {
        throw new Error('Message channel is undefined');
    }

    if (!channel.isTextBased()) {
        throw new Error('Channel is not text-based');
    }

    if (!('send' in channel)) {
        throw new Error('Channel does not support sending messages');
    }

    await channel.send(content);
}