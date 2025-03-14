import { Message, Collection, FetchMessagesOptions, NewsChannel, StageChannel, TextChannel, PublicThreadChannel, PrivateThreadChannel, VoiceChannel } from 'discord.js';

// Define the tool details
export const MessageToolDetails = [
    {
        name: "getChannelMessages",
        description: "Fetch recent messages from a channel",
        input_schema: {
            type: "object",
            properties: {
                channelId: {
                    type: "string",
                    description: "The channel's Id, e.g. '1234567890'",
                },
                limit: {
                    type: "number",
                    description: "The number of messages to fetch, max 1000.",
                }
            },
            required: ["userId"]
        }
    },
    {
        name: "getUserMessages",
        description: "Fetch recent messages from a user in this channel",
        input_schema: {
            type: "object",
            properties: {
                userId: {
                    type: "string",
                    description: "The user's Id, e.g. '1234567890'",
                },
                channelId: {
                    type: "string",
                    description: "The channel's Id, e.g. '1234567890'",
                },
                limit: {
                    type: "number",
                    description: "The number of messages to fetch, max 1000.",
                }
            },
            required: ["userId"]
        }
    }
]

/**
 * Fetch recent messages from a channel
 * @param message 
 * @param input 
 * @returns 
 */
export async function getChannelMessages(message: Message, input: object): Promise<string> {
    // Validate guild context
    if (!message.guild) {
        return 'This command can only be used in a server.';
    }

    try {
        // Extract and validate input
        const { channelId, limit = 100 } = input as { channelId: string, limit: number };
        if (!channelId) {
            return 'Channel ID is required';
        }

        // Get the channel from the guild
        const channel = message.guild.channels.cache.get(channelId);
        if (!channel) {
            return 'Channel not found';
        }
        if (!channel.isTextBased()) {
            return 'Channel must be a text channel';
        }

        // Set up timeout promise
        const timeoutPromise = new Promise(resolve => setTimeout(resolve, 5_000));

        // Fetch messages with timeout
        const fetchPromise = channel.messages.fetch({ limit: Math.min(limit, 1_000) });

        const result = await Promise.race([fetchPromise, timeoutPromise]);
        if (!result) {
            return 'No messages found in this channel';
        }

        // Format messages info into a readable string
        return JSON.stringify(result);

    } catch (error) {
        console.error('Error fetching channel messages:', error);
        return `Error fetching channel messages: ${error instanceof Error ? error.message : String(error)}`;
    }
}

/**
 * Fetch recent messages from a user
 * @param message 
 * @param input 
 * @returns 
 */
export async function getUserMessages(message: Message, input: object): Promise<string> {
    // Validate guild context
    if (!message.guild) {
        return 'This command can only be used in a server.';
    }

    try {
        // Extract and validate input
        const { userId, channelId, limit = 100 } = input as { userId: string, channelId: string, limit: number };
        if (!userId || !channelId) {
            return 'User ID and Channel ID are required';
        }

        // Get the channel from the guild
        const channel = message.guild.channels.cache.get(channelId);
        if (!channel) {
            return 'Channel not found';
        }
        if (!channel.isTextBased()) {
            return 'Channel must be a text channel';
        }

        // Fetch messages using the helper function
        const messages = await fetchMessages(channel, userId, Math.min(limit, 100));

        if (messages.length === 0) {
            return 'No messages found for this user';
        }

        return JSON.stringify(messages);

    } catch (error) {
        console.error('Error fetching user messages:', error);
        return `Error fetching user messages: ${error instanceof Error ? error.message : String(error)}`;
    }
}

/**
 * Internal helper function to fetch messages from a user
 * @param message 
 * @param userId 
 * @param limit 
 * @param timeoutMs 
 * @returns 
 */
export async function fetchMessages(channel: NewsChannel | StageChannel | TextChannel | PublicThreadChannel<boolean> | PrivateThreadChannel | VoiceChannel, userId: string, limit: number, timeoutMs = 5_000): Promise<Message[]> {
    const messageCollection = new Collection<string, Message>();
    const startTime = Date.now();
    let lastMessageId: string | undefined = undefined;

    try {
        while (messageCollection.size < limit) {
            if (Date.now() - startTime >= timeoutMs) {
                break;
            }

            const options: FetchMessagesOptions = lastMessageId
                ? { limit: Math.min(limit, 100), before: lastMessageId }
                : { limit: Math.min(limit, 100) };

            // Fetch batch of messages
            const fetchedMessages: Collection<string, Message> = await channel.messages.fetch(options);
            if (fetchedMessages.size === 0) {
                break;
            }

            // Update last message ID for pagination
            lastMessageId = fetchedMessages.last()?.id;

            // Filter messages by author and add to collection
            const userMessages = fetchedMessages.filter(msg => msg.author.id === userId);
            for (const [id, msg] of userMessages) {
                messageCollection.set(id, msg);
                if (messageCollection.size >= limit) {
                    break;
                }
            }

            // If we didn't get any more messages from this user or can't paginate further, stop
            if (userMessages.size === 0 || !lastMessageId) {
                break;
            }
        }
    } catch (error) {
        console.error('Error fetching messages:', error);
    }

    return [...messageCollection.values()];
}
