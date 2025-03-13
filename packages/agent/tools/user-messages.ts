// src/tools/user-messages.ts
import { Message, TextChannel } from 'discord.js';

export async function fetchUserMessages(message: Message, params: any): Promise<string> {
    const { userId, limit = 20 } = params;

    if (!message.channel || !(message.channel.isTextBased() && 'messages' in message.channel)) {
        return 'This command can only be used in text channels.';
    }

    try {
        const channel = message.channel as TextChannel;
        const messages = await channel.messages.fetch({ limit: 100 });
        const userMessages = messages.filter(msg => msg.author.id === userId);

        if (userMessages.size === 0) {
            return `No messages found from user with ID ${userId}`;
        }

        const formattedMessages = Array.from(userMessages.values())
            .slice(0, limit)
            .map(msg => `[${msg.createdAt.toISOString()}] ${msg.content}`)
            .join('\n');

        return `Found ${userMessages.size} messages from user. Here are up to ${limit} messages:\n${formattedMessages}`;
    } catch (error) {
        console.error('Error fetching user messages:', error);
        return `Error fetching messages: ${error}`;
    }
}
