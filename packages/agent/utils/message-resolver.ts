import {
    Client,
    Message,
    TextChannel,
    DMChannel,
    ThreadChannel,
    Collection,
    Guild,
    ChannelType
} from "discord.js";
import { ChannelResolver } from "./channel-resolver";
import { UserResolver } from "./user-resolver";

type FilterOptions = {
    fromUser?: string;
    type?: "gif" | "url" | "media" | "sticker";
    time?: {
        before?: Date | string;
        after?: Date | string;
    };
    limit?: number;
}

export class MessageResolver {
    /**
     * Fetches messages from a channel with various filter options
     * @param guild - Guild to fetch messages from
     * @param options - Options to filter messages
     * @returns Collection of messages that match the criteria
     */
    static async fetchMessages(
        guild: Guild,
        options: {
            fromUser?: string;
            inChannel?: string;
            type?: "gif" | "url" | "media" | "sticker";
            time?: {
                before?: string;
                after?: string;
            };
            limit?: number;
        }
    ): Promise<Collection<string, Message>> {
        const { fromUser, inChannel, type, time, limit = 100 } = options;

        try {
            // Resolve channel
            let targetChannel: TextChannel | ThreadChannel | DMChannel | null = null;

            if (inChannel) {
                const resolvedChannel = await ChannelResolver.resolve(guild, inChannel);

                if (!resolvedChannel ||
                    ![ChannelType.GuildText, ChannelType.DM, ChannelType.PublicThread,
                    ChannelType.PrivateThread, ChannelType.GuildAnnouncement].includes(resolvedChannel.type)) {
                    throw new Error(`Channel ${inChannel} not found or is not a text-based channel`);
                }

                targetChannel = resolvedChannel as TextChannel | ThreadChannel;
            } else {
                throw new Error("A channel must be specified");
            }

            // Resolve user if provided
            let targetUser = null;
            if (fromUser) {
                targetUser = await UserResolver.resolve(guild, fromUser!);
                if (!targetUser) {
                    throw new Error(`User ${fromUser} not found`);
                }
            }

            // Create fetch options
            const fetchOptions: { limit: number; before?: string; after?: string } = {
                limit: Math.min(limit, 100) // Discord API limit
            };

            // Add time filters
            if (time) {
                if (time.before) {
                    const beforeDate = typeof time.before === 'string'
                        ? new Date(time.before)
                        : time.before;

                    if (!isNaN(beforeDate.getTime())) {
                        fetchOptions.before = beforeDate.getTime().toString();
                    }
                }

                if (time.after) {
                    const afterDate = typeof time.after === 'string'
                        ? new Date(time.after)
                        : time.after;

                    if (!isNaN(afterDate.getTime())) {
                        fetchOptions.after = afterDate.getTime().toString();
                    }
                }
            }

            // Fetch messages
            const messages = await targetChannel.messages.fetch(fetchOptions);

            // Apply filters
            return this.filterMessages(messages, {
                fromUser: targetUser?.id,
                type,
                time: {
                    before: time?.before ? new Date(time.before) : undefined,
                    after: time?.after ? new Date(time.after) : undefined
                },
                limit
            });

        } catch (error) {
            console.error(`Failed to fetch messages: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return new Collection<string, Message>();
        }
    }

    /**
     * Filter messages based on criteria
     * @param messages - Collection of messages to filter
     * @param options - Filter options
     * @returns Filtered collection of messages
     */
    static filterMessages(
        messages: Collection<string, Message>,
        options: FilterOptions
    ): Collection<string, Message> {
        const { fromUser, type, time, limit } = options;

        let filtered = messages;

        // Filter by user
        if (fromUser) {
            filtered = filtered.filter(msg => msg.author.id === fromUser);
        }

        // Filter by message type
        if (type) {
            filtered = filtered.filter(msg => {
                switch (type) {
                    case 'gif':
                        return msg.content.includes('tenor.com/view/') ||
                            msg.content.includes('media.tenor.com/') ||
                            (msg.embeds.length > 0 && msg.embeds.some(e =>
                                e.url && (e.url.endsWith('.gif'))
                            ));

                    case 'url':
                        const urlRegex = /(https?:\/\/[^\s]+)/g;
                        return urlRegex.test(msg.content) ||
                            (msg.embeds.length > 0 && msg.embeds.some(e => e.url));

                    case 'media':
                        return (msg.attachments.size > 0 &&
                            msg.attachments.some(a =>
                                a.contentType?.startsWith('image/') ||
                                a.contentType?.startsWith('video/')
                            ))

                    case 'sticker':
                        return msg.stickers && msg.stickers.size > 0;

                    default:
                        return true;
                }
            });
        }

        // Filter by time
        if (time) {
            if (time.before) {
                filtered = filtered.filter(msg => msg.createdAt < time.before!);
            }

            if (time.after) {
                filtered = filtered.filter(msg => msg.createdAt > time.after!);
            }
        }

        // Apply limit
        if (limit && limit < filtered.size) {
            const limitedMessages = new Collection<string, Message>();
            let i = 0;

            for (const [id, message] of filtered) {
                if (i >= limit) break;
                limitedMessages.set(id, message);
                i++;
            }

            return limitedMessages;
        }

        return filtered;
    }

    /**
     * Format a message for display
     * @param message - Message to format
     * @returns Formatted message object
     */
    static formatMessage(message: Message): {
        id: string;
        content: string;
        author: {
            id: string;
            username: string;
            displayName: string;
        };
        attachments: Array<{ name: string; url: string; contentType?: string }>;
        embeds: Array<any>;
        timestamp: Date;
        channelId: string;
        hasStickers: boolean;
        reference?: {
            messageId?: string;
            channelId?: string;
            guildId?: string;
        };
    } {
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
            reference: message.reference ? {
                messageId: message.reference.messageId,
                channelId: message.reference.channelId,
                guildId: message.reference.guildId
            } : undefined
        };
    }
}