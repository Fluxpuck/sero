import { Message, GuildMember, Collection } from 'discord.js';

interface FindUserParams {
    query: string;
}

/**
 * Find a guild member based on ID, username, or display name
 * @param message - The Discord message that triggered the command
 * @param params - Search parameters containing the query string
 * @returns A GuildMember object if found, or an error message string
 */
function formatMemberInfo(member: GuildMember): string {
    return `### User Found: ${member.displayName}
**Username**: ${member.user.username}
**ID**: \`${member.id}\`
**Joined Server**: ${member.joinedAt?.toLocaleDateString() ?? 'Unknown'}
**Account Created**: ${member.user.createdAt.toLocaleDateString()}
**Roles**: ${member.roles.cache.size - 1} roles // -1 to exclude @everyone
**Status**: ${member.presence?.status ?? 'offline'}`;
}

export async function findUser(message: Message, params: FindUserParams): Promise<string> {
    // Validate guild context
    if (!message.guild) {
        return 'This command can only be used in a server.';
    }

    // Validate query
    const { query } = params;
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