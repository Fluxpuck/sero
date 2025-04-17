import { Message, Collection, Guild, } from "discord.js";
import { ChannelResolver } from "./channel-resolver";
import { MessageFormat } from "../types/message.types";

const MAX_FETCH_MESSAGES = 1_000; // Maximum of messages to fetch
const MAX_TIMEOUT_MS = 5_000; // Maximum of time to wait for messages to be fetched

type FilterOptions = {
    inChannel?: string;
    fromUser?: string;
    limit?: number;
    mode?: "user" | "channel" | "auto";
}

export class MessageResolver {

    static async fetchMessages(
        guild: Guild,
        options: FilterOptions = {}
    ): Promise<MessageFormat[] | null> {

        const { inChannel, fromUser, limit = MAX_FETCH_MESSAGES, mode = "auto" } = options;

        if (!inChannel) {
            console.error('Channel ID is required for channel mode');
            return null;
        }

        if (limit > MAX_FETCH_MESSAGES) {
            throw new Error(`Cannot fetch more than ${MAX_FETCH_MESSAGES} messages at once`);
        }

        // Determine fetch mode
        let fetchMode = mode;
        if (fetchMode === 'auto') {
            if (inChannel) {
                fetchMode = 'channel';
            } else if (fromUser) {
                fetchMode = 'user';
            }
        }

        try {
            switch (fetchMode) {

                case 'channel':
                    const channelMessages = await this.resolve(guild, inChannel, limit);
                    return channelMessages?.map(msg => this.formatMessage(msg)) ?? [];

                case 'user':
                    if (!fromUser) {
                        console.error('User ID is required for user mode');
                        throw new Error('User ID is required for user mode');
                    }

                    const message = await this.resolve(guild, inChannel, limit * 2);
                    const userMessages = message?.filter(msg => msg.author.id === fromUser);
                    return userMessages?.map(msg => this.formatMessage(msg)) ?? [];

                default:
                    console.error('Invalid fetch mode:', fetchMode);
                    return null;

            }
        } catch (error) {
            console.error('Error in fetchMessages:', error);
            return null;
        }
    }

    private static async resolve(guild: Guild, channelId: string, limit: number): Promise<Message[] | null> {
        try {
            const channel = await ChannelResolver.resolve(guild, channelId);
            if (!channel || !channel.isTextBased()) {
                return null;
            }

            const startTime = Date.now();
            const allMessages = [];
            let lastMessageId = null;
            let remaining = limit;

            // Loop until we have enough messages or there are no more to fetch
            while (remaining > 0) {

                // Check for timeout
                if (Date.now() - startTime >= MAX_TIMEOUT_MS) {
                    break;
                }

                // Calculate batch size (max 100 per Discord API limits)
                const fetchLimit = Math.min(remaining, 100);

                // Fetch the messages + options
                const options = { limit: fetchLimit, ...(lastMessageId && { before: lastMessageId }) };
                const messages = await channel.messages.fetch(options) as Collection<string, Message>;

                // If no messages were returned, we're done
                if (messages.size === 0) break;

                // Add messages to our collection and update counters
                allMessages.push(...Array.from(messages.values()));
                remaining -= messages.size;

                // Update lastMessageId for pagination
                lastMessageId = messages.last()?.id;

                // If we didn't get a full page, no need to fetch more
                if (messages.size < fetchLimit) break;
            }

            return allMessages;

        } catch (error) {
            console.error('Error in fetchChannelMessages:', error);
            return null;
        }
    }

    /**
     * Format a message for display
     * @param message - Message to format
     * @returns Formatted message object
     */
    static formatMessage(message: Message): MessageFormat {
        return {
            id: message.id,
            content: message.content,
            author: {
                id: message.author.id,
                username: message.author.username,
                displayName: message.author.displayName
            },
            attachments: Array.from(message.attachments.values()).map(a => ({
                name: a.name || 'unknown',
                url: a.url,
                contentType: a.contentType || undefined
            })),
            embeds: message.embeds.map(e => ({
                title: e.title,
                description: e.description,
                url: e.url
            })),
            timestamp: message.createdAt,
            channelId: message.channelId,
            hasStickers: message.stickers.size > 0,
        };
    }
}
