// src/utils.ts
import { Message, ChannelType } from 'discord.js';

// Extract the command from a message
export function processCommand(message: Message, prefix: string): string {
    return message.content.slice(prefix.length).trim();
}

// Extract user ID from a mention
export function getUserIdFromMention(mention: string): string | null {
    // The format of a mention is <@USER_ID> or <@!USER_ID>
    const matches = mention.match(/^<@!?(\d+)>$/);
    if (matches) {
        return matches[1];
    }
    return null;
}

// Add this helper function at the bottom of the file
export function getChannelName(channel: any): string {
    if (channel.type === ChannelType.DM) {
        return 'Direct Message';
    }

    if (channel.type === ChannelType.GroupDM) {
        return 'Group Direct Message';
    }

    // For guild channels that have a name property
    if (channel.name) {
        return channel.name;
    }

    // Fallback
    return 'Unknown Channel';
}