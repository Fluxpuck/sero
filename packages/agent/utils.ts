import { Message, ChannelType, Channel, Guild } from 'discord.js';

// Sanitize the AI response by removing mentions
export function sanitizeResponse(text: string): string {
    return text
        .replace(/@everyone/gi, 'everyone') // Replace everyone mentions
        .replace(/@here/gi, 'here') // Replace here mentions
}

// Helper function to split messages that exceed Discord's character limit
export function splitMessage(text: string, maxLength = 2_000): string[] {
    const chunks: string[] = [];
    let currentChunk = '';

    const lines = text.split('\n');

    for (const line of lines) {
        // If adding this line would exceed the limit, push the current chunk and start a new one
        if (currentChunk.length + line.length + 1 > maxLength) {
            chunks.push(currentChunk);
            currentChunk = line + '\n';
        } else {
            currentChunk += line + '\n';
        }
    }

    // Don't forget the last chunk
    if (currentChunk) {
        chunks.push(currentChunk);
    }

    return chunks;
}