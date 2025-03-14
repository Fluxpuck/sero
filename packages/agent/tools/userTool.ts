import { Message, GuildMember, Collection } from 'discord.js';

// Define the tool details
export const UserToolDetails = [
    {
        name: "findUser",
        description: "Find a guild member based on a userId or username",
        input_schema: {
            type: "object",
            properties: {
                query: {
                    type: "string",
                    description: "The user's name or Id, e.g. '1234567890' or 'username'",
                }
            },
            required: ["query"]
        }
    },
    {
        name: "timeoutUser",
        description: "Timeout a user from sending messages for a specified duration",
        input_schema: {
            type: "object",
            properties: {
                userId: {
                    type: "string",
                    description: "The user's Id, e.g. '1234567890'",
                },
                duration: {
                    type: "string",
                    description: "The duration of the timeout in seconds, e.g. '60'. Preferably between 1 and 3600.",
                },
                reason: {
                    type: "string",
                    description: "The reason for the timeout, e.g 'Flooding the chat with messages' or 'Sending inappropriate content'",
                }
            },
            required: ["userId", "duration", "reason"]
        }
    },
    {
        name: "disconnectUser",
        description: "Disconnect a user from the voice channel",
        input_schema: {
            type: "object",
            properties: {
                userId: {
                    type: "string",
                    description: "The user's Id, e.g. '1234567890'",
                }
            },
            required: ["userId"]
        }
    },
]

/**
 * Find a guild member based on userId, username, or display name
 * @param message 
 * @param params 
 * @returns 
 */
export async function findUser(message: Message, input: object): Promise<string> {

    // Validate guild context
    if (!message.guild) {
        return 'This command can only be used in a server.';
    }

    // Extract & validate query from input
    const query = (input as any).query;
    if (!query || query.length < 2) {
        return 'Please provide at least 2 characters to search for a user.';
    }

    try {
        let member: GuildMember | undefined;
        const lowerQuery = query.toLowerCase();

        // Check if query is a Discord ID (snowflake)
        if (/^\d{17,19}$/.test(query)) {
            try {
                member = await message.guild.members.fetch(query);
                return formatMemberInfo(member);
            } catch (error) {
                // Continue to name search if ID lookup fails
                // No need to log here as this is an expected fallback path
            }
        }

        // Fetch members (with caching optimization)
        let members: Collection<string, GuildMember>;
        if (message.guild.members.cache.size === message.guild.memberCount) {
            // Use cache if we already have all members
            members = message.guild.members.cache;
        } else {
            members = await message.guild.members.fetch();
        }

        // Search with priority: exact matches first, then partial matches
        // First try exact username/displayName match
        member = members.find(m =>
            m.user.username.toLowerCase() === lowerQuery ||
            m.displayName.toLowerCase() === lowerQuery
        );

        // If no exact match, look for partial matches
        if (!member) {
            member = members.find(m =>
                m.user.username.toLowerCase().includes(lowerQuery) ||
                m.displayName.toLowerCase().includes(lowerQuery)
            );
        }

        if (!member) {
            return `No user found matching "${query}"`;
        }

        // Format member info into a readable string
        return formatMemberInfo(member);

    } catch (error) {
        console.error('Error finding user:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return `An error occurred while searching for the user. Please try again later. (${errorMessage})`;
    }
}

/**
 * Find a guild member based on ID, username, or display name
 * @param message - The Discord message that triggered the command
 * @param params - Search parameters containing the query string
 * @returns A GuildMember object if found, or an error message string
 */
function formatMemberInfo(member: GuildMember): string {
    return `
    Member Information:
    - Display Name: ${member.displayName}
    - Username: ${member.user.username}
    - ID: ${member.user.id}
    - Joined Server: ${member.joinedAt?.toLocaleDateString() ?? 'Unknown'}
    - Account Created: ${member.user.createdAt.toLocaleDateString()}
    - Roles: ${member.roles.cache.filter(role => role.name !== '@everyone').map(role => `${role.name} (${role.id})`).join(', ')}
    ${member.communicationDisabledUntil && member.communicationDisabledUntil > new Date() ? `- Timeout Until: ${member.communicationDisabledUntil.toISOString()}` : ''}
    ${member.voice?.channelId ? `
    Voice State, e.g. the voice channel the member is in:
    - Channel ID: ${member.voice.channelId}
    - Self Mute: ${member.voice.selfMute}
    - Server Mute: ${member.voice.serverMute}
    - Self Deaf: ${member.voice.selfDeaf}
    - Server Deaf: ${member.voice.serverDeaf}
    - Streaming: ${member.voice.streaming}
    - Self Video: ${member.voice.selfVideo}` : ''}`;
}

/**
 * Timeout a user from sending messages for a specified duration
 * @param message 
 * @param input 
 * @returns 
 */
export async function timeoutUser(message: Message, input: object): Promise<string> {
    // Validate guild context
    if (!message.guild) {
        return 'This command can only be used in a server.';
    }

    // Extract & validate input parameters
    const userId = (input as any).userId;
    const duration = parseInt((input as any).duration);
    const reason = (input as any).reason;

    if (!userId || !duration || !reason) {
        return 'Please provide a valid userId, duration, and reason for the timeout.';
    }

    // Fetch the member to be timed out
    let member: GuildMember;
    try {
        member = await message.guild.members.fetch(userId);
    } catch (error) {
        return `User with ID \`${userId}\` not found in this server.`;
    }

    try {
        const durationMs = duration * 1000; // Convert seconds to milliseconds
        await member.timeout(durationMs, `${reason} - Moderator: ${message.author.tag}`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('Missing Permissions')) {
            return 'I do not have permission to timeout this user. Please check my role permissions.';
        }
        return `Couldn't timeout user: ${errorMessage}`;
    }

    return `User ${member.user.tag} has been timed out for ${duration} seconds for: ${reason}`;
}

/**
 * Disconnect a user from the voice channel
 * @param message 
 * @param input 
 * @returns 
 */
export async function disconnectUser(message: Message, input: object): Promise<string> {
    // Validate guild context
    if (!message.guild) {
        return 'This command can only be used in a server.';
    }

    // Extract & validate input parameters
    const userId = (input as any).userId;

    if (!userId) {
        return 'Please provide a valid userId for the user to disconnect.';
    }

    // Fetch the member to be timed out
    let member: GuildMember;
    try {
        member = await message.guild.members.fetch(userId);
    } catch (error) {
        return `User with ID \`${userId}\` not found in this server.`;
    }

    // Disconnect the user from the voice channel
    if (member?.voice.channel) {
        try {
            await member.voice.disconnect();
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('Missing Permissions')) {
                return 'I do not have permission to disconnect this user. Please check my role permissions.';
            }
            return `Couldn't disconnect user: ${errorMessage}`;
        }
    } else {
        return `User ${member.user.tag} is not connected to a voice channel.`;
    }

    return `User ${member.user.tag} has been disconnected from the voice channel.`;
}