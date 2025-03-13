import { Message, GuildMember } from 'discord.js';

interface SearchUserParams {
    query: string;
    limit?: number;
}

interface UserSearchResult {
    id: string;
    username: string;
    displayName: string;
    roles: string[];
    joinedAt: Date | null;
    matchScore: number;  // Add match score for better sorting
}

function calculateMatchScore(query: string, username: string, displayName: string): number {
    query = query.toLowerCase();
    username = username.toLowerCase();
    displayName = displayName.toLowerCase();

    // Direct matches get highest score
    if (username === query || displayName === query) return 100;

    // Starts with query gets high score
    if (username.startsWith(query) || displayName.startsWith(query)) return 80;

    // Contains query as a word gets medium score
    if (username.includes(` ${query}`) || displayName.includes(` ${query}`)) return 60;

    // Contains query anywhere gets lower score
    if (username.includes(query) || displayName.includes(query)) return 40;

    // Split query into parts and check if all parts exist
    const queryParts = query.split(/[\s-_]+/);
    const allPartsMatch = queryParts.every(part =>
        username.includes(part) || displayName.includes(part)
    );

    return allPartsMatch ? 20 : 0;
}

export async function searchUser(message: Message, params: SearchUserParams): Promise<string> {
    if (!message.guild) {
        return 'This command can only be used in a server.';
    }

    try {
        const { query, limit = 5 } = params;

        if (query.length < 2) {
            return 'Please provide at least 2 characters for the search.';
        }

        // Fetch all members
        const members = await message.guild.members.fetch();

        // Search and score matching members
        const matchingMembers = Array.from(members.values())
            .map(member => ({
                member,
                score: calculateMatchScore(
                    query,
                    member.user.username,
                    member.displayName
                )
            }))
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        if (matchingMembers.length === 0) {
            return `No users found matching "${query}"`;
        }

        // Format results with match indicators
        const results = matchingMembers.map(({ member }) => ({
            id: member.id,
            username: member.user.username,
            displayName: member.displayName,
            roles: member.roles.cache
                .filter(role => role.name !== '@everyone')
                .map(role => role.name),
            joinedAt: member.joinedAt
        }));

        // Format the results with markdown
        const formattedResults = results
            .map(user => {
                const roles = user.roles.length > 0
                    ? `\n**Roles**: ${user.roles.join(', ')}`
                    : '';
                const joinedAt = user.joinedAt
                    ? `\n**Joined**: ${user.joinedAt.toLocaleDateString()}`
                    : '';

                return `### ${user.displayName} (${user.username})` +
                    `\n**ID**: \`${user.id}\`${roles}${joinedAt}`;
            })
            .join('\n\n');

        return `Found ${results.length} user(s) matching "${query}":\n\n${formattedResults}`;

    } catch (error) {
        console.error('Error searching for users:', error);
        return `Error searching for users: ${error instanceof Error ? error.message : String(error)}`;
    }
}