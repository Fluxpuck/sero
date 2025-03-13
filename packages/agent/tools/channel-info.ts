// src/tools/channel-info.ts
import { Message, TextChannel } from 'discord.js';

export async function getChannelInfo(message: Message): Promise<string> {
    if (!message.channel || !(message.channel.isTextBased() && 'members' in message.channel)) {
        return 'This command can only be used in text channels with members.';
    }

    try {
        const channel = message.channel as TextChannel;
        return JSON.stringify({
            id: channel.id,
            name: channel.name,
            topic: channel.topic,
            createdAt: channel.createdAt,
            isNSFW: channel.nsfw,
            memberCount: channel.members.size
        }, null, 2);
    } catch (error) {
        console.error('Error getting channel info:', error);
        return `Error getting channel info: ${error}`;
    }
}