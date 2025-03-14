import { Message } from 'discord.js';

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
                    description: "The number of messages to fetch",
                }
            },
            required: ["userId"]
        }
    },
    {
        name: "getUserMessages",
        description: "Fetch recent messages from a user",
        input_schema: {
            type: "object",
            properties: {
                userId: {
                    type: "string",
                    description: "The user's Id, e.g. '1234567890'",
                },
                limit: {
                    type: "number",
                    description: "The number of messages to fetch",
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

        // Fetch messages
        const messages = (await channel.messages.fetch({ limit })).toJSON();

        // Format messages info into a readable string
        return JSON.stringify(messages);

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
        const { userId, limit = 100 } = input as { userId: string, limit: number };
        if (!userId) {
            return 'User ID is required';
        }

        // Get the user from the guild
        const user = await message.guild.members.fetch(userId);
        if (!user) {
            return 'User not found';
        }

        // Fetch messages from all text channels with timeout
        const textChannels = message.guild.channels.cache.filter(channel => channel.isTextBased());
        const allMessages: Message[] = [];
        const timeoutPromise = new Promise(resolve => setTimeout(resolve, 5000));

        const fetchPromise = (async () => {
            for (const channel of textChannels.values()) {
                const channelMessages = await channel.messages.fetch({ limit: 100 });
                allMessages.push(...channelMessages.filter(msg => msg.author.id === userId).values());
                if (allMessages.length >= limit) break;
            }
        })();

        // Race between fetch and timeout
        await Promise.race([fetchPromise, timeoutPromise]);

        // Return what we have so far, limited to the requested amount
        return JSON.stringify(allMessages.slice(0, limit));

    } catch (error) {
        console.error('Error fetching user messages:', error);
        return `Error fetching user messages: ${error instanceof Error ? error.message : String(error)}`;
    }
}