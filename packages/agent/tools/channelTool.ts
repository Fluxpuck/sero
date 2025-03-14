import { Message, GuildMember, GuildChannel, GuildBasedChannel, Collection, ChannelType } from 'discord.js';
import { sanitizeResponse } from '../utils';

// Define the tool details
export const ChannelToolDetails = [
    {
        name: "findChannel",
        description: "Find a guild channel based on a channelId or channel-name",
        input_schema: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "The channel name or Id, e.g. '1234567890' or 'name'",
                }
            },
            required: ["query"]
        }
    },
    {
        name: "sendChannelMessage",
        description: "Send a message to a channel (preferred method)",
        input_schema: {
            type: "object",
            properties: {
                channelId: {
                    type: "string",
                    description: "The channel's Id, e.g. '1234567890'",
                },
                content: {
                    type: "string",
                    description: "The message content to send",
                }
            },
            required: ["channelId", "content"]
        }
    },
    {
        name: "sendDMMessage",
        description: "Send a direct message to a user (only when explicitly requested)",
        input_schema: {
            type: "object",
            properties: {
                userId: {
                    type: "string",
                    description: "The user's Id, e.g. '1234567890'",
                },
                content: {
                    type: "string",
                    description: "The message content to send",
                }
            },
            required: ["userId", "content"]
        }
    }
]

export async function getAllChannels(message: Message): Promise<string> {
    // Validate guild context
    if (!message.guild) {
        return 'This command can only be used in a server.';
    }

    try {
        // Get all channels in the guild
        const channels = message.guild.channels.cache;
        const channelList = channels.map((channel: any) => {
            return `${channel.name} (${channel.id})`;
        });

        return `Channels in this server: ${channelList.join(', ')}`;
    } catch (error) {
        console.error('Error getting channels:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `Failed to get channels: ${errorMessage}`;
    }
}

/**
 * Find a guild channel based on ID or name
 * @param message 
 * @param input - query
 * @returns 
 */
export async function findChannel(message: Message, input: object): Promise<string> {

    // Validate guild context
    if (!message.guild) {
        return 'This command can only be used in a server.';
    }

    // Extract & validate query from input
    const query = (input as any).query;
    if (!query || query.length < 2) {
        return 'Please provide at least 2 characters to search for a channel.';
    }

    try {
        let channel: GuildChannel | GuildBasedChannel | undefined;
        const lowerQuery = query.toLowerCase();

        // Check if the query is a Discord ID (snowflake)
        if (/^\d{17,19}$/.test(query)) {
            try {
                channel = message.guild.channels.cache.get(query);
            } catch (error) {
                // Continue to name search if ID lookup fails
                // No need to log here as this is an expected fallback path
            }
        }

        // If channel not found by ID, search by name
        if (!channel) {
            channel = message.guild.channels.cache.find(
                ch => ch.name.toLowerCase().includes(lowerQuery)
            );
        }

        if (!channel) {
            return 'Channel not found';
        }

        // Format channel info into a readable string
        return JSON.stringify(channel);

    } catch (error) {
        console.error('Error finding user:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `An error occurred while searching for the user. Please try again later. (${errorMessage})`;
    }
}

/**
 * Send a message to a channel
 * @param message 
 * @param input - channelId, content
 * @returns  
 */
export async function sendChannelMessage(message: Message, input: object): Promise<string> {
    // Validate guild context
    if (!message.guild) {
        return 'This command can only be used in a server.';
    }

    try {
        // Extract and validate input
        const { channelId, content } = input as { channelId: string; content: string };
        if (!channelId || !content) {
            return 'Both channelId and content are required.';
        }

        // Find the channel
        const channel = message.guild.channels.cache.get(channelId);
        if (!channel || !channel.isTextBased()) {
            return 'Invalid channel or channel is not text-based.';
        }

        // Send the message
        await channel.send(sanitizeResponse(content));
        return `Message sent successfully to ${channel.name}.`;

    } catch (error) {
        console.error('Error sending message:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `Failed to send message: ${errorMessage}`;
    }
}

/**
 * Send a direct message to a user
 * @param message 
 * @param input 
 */
export async function sendDMMessage(message: Message, input: object): Promise<string> {
    // Validate guild context
    if (!message.guild) {
        return 'This command can only be used in a server.';
    }

    try {
        // Extract and validate input
        const { userId, content } = input as { userId: string; content: string };
        if (!userId || !content) {
            return 'Both userId and content are required.';
        }

        // Fetch the member
        let member: GuildMember;
        try {
            member = await message.guild.members.fetch(userId);
        } catch (error) {
            return `User with ID \`${userId}\` not found in this server.`;
        }

        try {
            // Send the DM to the member
            await member.send(sanitizeResponse(content))
        } catch (error) {
            return `Could not send a DM to to ${member.user.tag}, most likely due to their privacy settings.`;
        }

        return `Message sent successfully to ${member.user.tag}.`;

    } catch (error) {
        console.error('Error sending DM:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `Failed to send DM: ${errorMessage}`;
    }
}

