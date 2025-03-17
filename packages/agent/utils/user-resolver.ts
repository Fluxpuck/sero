import { Collection, Snowflake, Guild, GuildMember } from 'discord.js';

/**
 * Find a user by their username
 * @param {Guild} guild - Discord Guild object
 * @param {string} query - Query to search for
 * @returns {Promise<GuildMember | null>}
 */
export async function findUser(
    guild: Guild,
    query: string
): Promise<GuildMember | null> {
    if (!guild || !query) return null;

    try {
        // Check if query is a user ID and try to fetch directly
        if (/^\d{17,19}$/.test(query)) {
            return findUserById(guild, query).catch(() => null);
        }

        return (await searchMembers(guild, query, 1)).first() ?? null;
    } catch (error) {
        console.error(`Error findUser: ${error}`);
        return null;
    }
}



/**
 * Find a user by their Discord Snowflake ID
 */
function findUserById(guild: Guild, id: string): Promise<GuildMember | null> {
    return guild.members.fetch(id as Snowflake);
}

/**
 * Advanced search function for finding members by username, nickname, or global name
 * Could return multiple potential matches instead of just one
 */
async function searchMembers(
    guild: Guild,
    query: string,
    limit: number = 3
): Promise<Collection<string, GuildMember>> {
    if (!guild || !query) return new Collection<string, GuildMember>();

    try {
        return await guild.members.search({ query, limit });
    } catch (error) {
        console.error(`Error searchMembers "${query}": ${error}`);
        return new Collection<string, GuildMember>();
    }
}
