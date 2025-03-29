import { Snowflake, Collection, Guild, GuildMember } from 'discord.js';
import { levenshteinDistance } from "../utils";

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

export class UserResolver {
    /**
     * Attempts to resolve a user from various input types with fuzzy matching
     */
    static async resolve(
        guild: Guild,
        input: string,
        options: Partial<UserSearchOptions> = {}
    ): Promise<GuildMember | null> {
        const {
            fuzzyThreshold = 0.4,
            searchType = 'all',
            caseSensitive = false
        } = options;

        if (!guild || !input) return null;

        try {
            // Try mention format (<@123456789>)
            const mentionMatch = input.match(/^<@!?(\d+)>$/);
            if (mentionMatch) {
                return await this.findUserById(guild, mentionMatch[1]);
            }

            // Direct ID lookup
            if (/^\d{17,19}$/.test(input)) {
                return await this.findUserById(guild, input);
            }

            // Perform advanced search
            return (await this.searchUsers(guild, input, {
                limit: 1,
                fuzzyThreshold,
                searchType,
                caseSensitive
            })).first() ?? null;

        } catch (error) {
            console.error(`User resolve error: ${error instanceof Error ? error.message : error}`);
            return null;
        }
    }

    /**
     * Search for multiple users matching the criteria
     */
    static async searchUsers(
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
            // First, try Discord's native search
            const nativeResults = await guild.members.search({
                query,
                limit
            });

            if (nativeResults.size > 0) {
                return nativeResults;
            }

            // Fallback to manual filtering with fuzzy matching
            const members = await guild.members.fetch();
            const searchTerm = caseSensitive ? query : query.toLowerCase();

            const filtered = members.filter(member => {
                const fields = this.getSearchFields(member, searchType, caseSensitive);

                // Check each field using levenshtein distance
                return fields.some(field => {
                    // Exact match
                    if (field === searchTerm) return true;

                    // Fuzzy matching with normalized distance
                    const distance = levenshteinDistance(field, searchTerm);
                    const maxLength = Math.max(field.length, searchTerm.length);
                    const normalizedDistance = distance / maxLength;

                    return normalizedDistance <= fuzzyThreshold;
                });
            });

            return new Collection(Array.from(filtered.entries()).slice(0, limit));
        } catch (error) {
            console.error(`Users search error: ${error instanceof Error ? error.message : error}`);
            return new Collection();
        }
    }

    /**
     * Find a user by their Discord Snowflake ID
     */
    private static async findUserById(guild: Guild, id: string): Promise<GuildMember | null> {
        try {
            return await guild.members.fetch(id as Snowflake);
        } catch {
            return null;
        }
    }

    /**
     * Get searchable fields based on search type
     */
    private static getSearchFields(
        member: GuildMember,
        searchType: UserSearchOptions['searchType'],
        caseSensitive: boolean
    ): string[] {
        const fields: string[] = [];
        const transform = (str: string) => caseSensitive ? str : str.toLowerCase();

        switch (searchType) {
            case 'username':
                fields.push(transform(member.user.username));
                break;
            case 'displayName':
                fields.push(transform(member.displayName));
                break;
            case 'nickname':
                if (member.nickname) fields.push(transform(member.nickname));
                break;
            default: // 'all'
                fields.push(transform(member.user.username));
                fields.push(transform(member.displayName));
                if (member.nickname) fields.push(transform(member.nickname));
        }

        return fields;
    }

    /**
     * Format user information for display or logging
     */
    static formatUser(member: GuildMember): {
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
}