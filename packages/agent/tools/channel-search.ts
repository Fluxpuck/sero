// src/tools/channel-search.ts
import { Message, TextChannel } from 'discord.js';

export async function searchChannelHistory(message: Message, params: any): Promise<string> {
    const { keywords, limit = 10 } = params;

    if (!message.channel || !(message.channel.isTextBased() && 'messages' in message.channel)) {
        return 'This command can only be used in text channels.';
    }

    try {
        const channel = message.channel as TextChannel;
        const messages = await channel.messages.fetch({ limit: 100 });
        const matchingMessages = messages.filter(msg =>
            msg.content.toLowerCase().includes(keywords.toLowerCase())
        );

        if (matchingMessages.size === 0) {
            return `No messages found containing "${keywords}"`;
        }

        const formattedMessages = Array.from(matchingMessages.values())
            .slice(0, limit)
            .map(msg => `[${msg.createdAt.toISOString()}] ${msg.author.username}: ${msg.content}`)
            .join('\n');

        return `Found ${matchingMessages.size} messages containing "${keywords}". Here are up to ${limit} matches:\n${formattedMessages}`;
    } catch (error) {
        console.error('Error searching channel history:', error);
        return `Error searching messages: ${error}`;
    }
}