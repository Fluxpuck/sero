import {
    Collection,
    Snowflake,
    Guild,
    GuildMember,
    User
} from 'discord.js';

interface UserSearchOptions {
    /** Maximum number of results to return */
    limit?: number;
    /** Fuzzy matching threshold (0-1) */
    fuzzyThreshold?: number;
    /** Search across username, display name, and nickname */
    searchType?: 'all' | 'username' | 'displayName' | 'nickname';
    /** Case-sensitive search */
    caseSensitive?: boolean;
}

/**
 * Find a user with advanced search capabilities
 */
export async function findUser(
    guild: Guild,
    query: string,
    options: UserSearchOptions = {}
): Promise<GuildMember | null> {
    const {
        limit = 1,
        fuzzyThreshold = 0.4,
        searchType = 'all',
        caseSensitive = false
    } = options;

    if (!guild || !query) return null;

    try {
        // Direct ID lookup
        if (/^\d{17,19}$/.test(query)) {
            return await findUserById(guild, query);
        }

        // Prepare search query
        const searchTerm = caseSensitive ? query : query.toLowerCase();

        // Perform advanced search
        const results = await advancedMemberSearch(
            guild,
            searchTerm,
            { limit, fuzzyThreshold, searchType, caseSensitive }
        );

        return results.first() ?? null;
    } catch (error) {
        console.error(`User search error: ${error instanceof Error ? error.message : error}`);
        return null;
    }
}

/**
 * Find multiple users matching search criteria
 */
export async function findUsers(
    guild: Guild,
    query: string,
    options: UserSearchOptions = {}
): Promise<Collection<string, GuildMember>> {
    const {
        limit = 5,
        fuzzyThreshold = 0.4,
        searchType = 'all',
        caseSensitive = false
    } = options;

    if (!guild || !query) return new Collection();

    try {
        // Perform advanced search
        return await advancedMemberSearch(
            guild,
            caseSensitive ? query : query.toLowerCase(),
            { limit, fuzzyThreshold, searchType, caseSensitive }
        );
    } catch (error) {
        console.error(`Users search error: ${error instanceof Error ? error.message : error}`);
        return new Collection();
    }
}

/**
 * Find a user by their Discord Snowflake ID with improved error handling
 */
async function findUserById(guild: Guild, id: string): Promise<GuildMember | null> {
    try {
        return await guild.members.fetch(id as Snowflake);
    } catch {
        return null;
    }
}

/**
 * Advanced member search with fuzzy matching and multiple search types
 */
async function advancedMemberSearch(
    guild: Guild,
    query: string,
    options: Required<UserSearchOptions>
): Promise<Collection<string, GuildMember>> {
    if (!guild || !query) return new Collection();

    try {
        // First, try Discord's native search
        const nativeResults = await guild.members.search({
            query,
            limit: options.limit
        });

        if (nativeResults.size > 0) {
            return nativeResults;
        }

        // Fallback to manual filtering if native search fails
        const members = await guild.members.fetch();

        const filtered = members.filter(member => {
            // Determine which fields to search based on options
            const searchFields: Array<string | undefined> = [];
            switch (options.searchType) {
                case 'username':
                    searchFields.push(
                        options.caseSensitive ? member.user.username : member.user.username.toLowerCase()
                    );
                    break;
                case 'displayName':
                    searchFields.push(
                        options.caseSensitive ? member.displayName : member.displayName.toLowerCase()
                    );
                    break;
                case 'nickname':
                    searchFields.push(
                        member.nickname
                            ? (options.caseSensitive ? member.nickname : member.nickname.toLowerCase())
                            : undefined
                    );
                    break;
                default: // 'all'
                    searchFields.push(
                        options.caseSensitive ? member.user.username : member.user.username.toLowerCase(),
                        member.displayName ?
                            (options.caseSensitive ? member.displayName : member.displayName.toLowerCase())
                            : undefined,
                        member.nickname ?
                            (options.caseSensitive ? member.nickname : member.nickname.toLowerCase())
                            : undefined
                    );
            }

            // Fuzzy matching
            return searchFields.some(field => {
                if (!field) return false;

                // Exact match
                if (field === query) return true;

                // Includes match
                if (field.includes(query)) return true;

                // Levenshtein distance matching
                const distance = levenshteinDistance(field, query);
                const maxLength = Math.max(field.length, query.length);
                const normalizedDistance = distance / maxLength;

                return normalizedDistance <= options.fuzzyThreshold;
            });
        });

        // Return limited results
        return new Collection(
            Array.from(filtered.entries()).slice(0, options.limit)
        );
    } catch (error) {
        console.error(`Advanced member search error: ${error}`);
        return new Collection();
    }
}

/**
 * Optimized Levenshtein distance calculation
 */
function levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = Array(b.length + 1)
        .fill(0)
        .map(() => Array(a.length + 1).fill(0));

    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
            if (a[i - 1] === b[j - 1]) {
                matrix[j][i] = matrix[j - 1][i - 1];
            } else {
                matrix[j][i] = Math.min(
                    matrix[j][i - 1] + 1,  // Insertion
                    matrix[j - 1][i] + 1,  // Deletion
                    matrix[j - 1][i - 1] + 1  // Substitution
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Format user information for display or logging
 */
export function formatUser(member: GuildMember): {
    id: string;
    username: string;
    displayName: string;
    nickname?: string;
    joinedAt?: Date;
    avatarURL?: string;
} {
    return {
        id: member.id,
        username: member.user.username,
        displayName: member.displayName,
        nickname: member.nickname ?? undefined,
        joinedAt: member.joinedAt ?? undefined,
        avatarURL: member.avatarURL() ?? undefined
    };
}