import { Role, Guild, GuildMember, Collection } from 'discord.js';
import { levenshteinDistance } from "../utils";

export class RoleResolver {
    /**
     * Attempts to resolve a role from various input types with fuzzy matching
     * @param input - The input to resolve (ID, name, mention)
     * @param guild - The guild to search in
     * @param options - Search options including fuzzy matching threshold
     * @returns The resolved Role or null if not found
     */
    static async resolve(
        input: string,
        guild: Guild,
        options: {
            fuzzyThreshold?: number,
            caseSensitive?: boolean
        } = {}
    ): Promise<Role | null> {
        const {
            fuzzyThreshold = 0.4,
            caseSensitive = false
        } = options;

        // If input is empty, return null
        if (!input) return null;

        // Try to resolve from mention (<@&123456789>)
        const mentionMatch = input.match(/^<@&(\d+)>$/);
        if (mentionMatch) {
            return guild.roles.cache.get(mentionMatch[1]) || null;
        }

        // Try to resolve from ID
        if (/^\d+$/.test(input)) {
            return guild.roles.cache.get(input) || null;
        }

        // Prepare search term
        const searchTerm = caseSensitive ? input : input.toLowerCase();

        // Search with fuzzy matching
        const matches = guild.roles.cache.filter(role => {
            const roleName = caseSensitive ? role.name : role.name.toLowerCase();

            // Exact match
            if (roleName === searchTerm) return true;

            // Includes match
            if (roleName.includes(searchTerm)) return true;

            // Fuzzy matching with normalized distance
            const distance = levenshteinDistance(roleName, searchTerm);
            const maxLength = Math.max(roleName.length, searchTerm.length);
            const normalizedDistance = distance / maxLength;

            return normalizedDistance <= fuzzyThreshold;
        });

        // Return the best match (first result) or null
        return matches.first() || null;
    }

    /**
     * Searches for roles with fuzzy matching
     * @param guild - The guild to search in
     * @param query - The search query
     * @param options - Search options
     */
    static async searchRoles(
        guild: Guild,
        query: string,
        options: {
            limit?: number,
            fuzzyThreshold?: number,
            caseSensitive?: boolean
        } = {}
    ): Promise<Collection<string, Role>> {
        const {
            limit = 1,
            fuzzyThreshold = 0.4,
            caseSensitive = false
        } = options;

        if (!guild || !query) return new Collection();

        const searchTerm = caseSensitive ? query : query.toLowerCase();

        const matches = guild.roles.cache.filter(role => {
            const roleName = caseSensitive ? role.name : role.name.toLowerCase();

            // Exact match
            if (roleName === searchTerm) return true;

            // Includes match
            if (roleName.includes(searchTerm)) return true;

            // Fuzzy matching with normalized distance
            const distance = levenshteinDistance(roleName, searchTerm);
            const maxLength = Math.max(roleName.length, searchTerm.length);
            const normalizedDistance = distance / maxLength;

            return normalizedDistance <= fuzzyThreshold;
        });

        return new Collection(Array.from(matches.entries()).slice(0, limit));
    }

    /**
     * Checks if a member has a specific role
     * @param member - The guild member to check
     * @param roleInput - The role to check for
     * @returns boolean indicating if the member has the role
     */
    static async hasRole(
        member: GuildMember,
        roleInput: string | Role
    ): Promise<boolean> {
        const role =
            roleInput instanceof Role
                ? roleInput
                : await this.resolve(roleInput, member.guild);

        if (!role) return false;
        return member.roles.cache.has(role.id);
    }
}