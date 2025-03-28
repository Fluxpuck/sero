import {
    Collection,
    Snowflake,
    Guild,
    GuildChannel,
    ChannelType
} from "discord.js";

/**
 * Get all channels in a guild with enhanced error handling and type safety
 */
export async function getAllChannels(guild: Guild): Promise<Collection<string, GuildChannel>> {
    try {
        // Ensure channels are fetched before filtering
        await guild.channels.fetch();

        // More comprehensive channel type filtering with type guard
        return guild.channels.cache.filter(
            (ch) =>
                ch.type === ChannelType.GuildText ||
                ch.type === ChannelType.GuildVoice ||
                ch.type === ChannelType.GuildCategory ||
                ch.type === ChannelType.GuildStageVoice ||
                ch.type === ChannelType.GuildAnnouncement ||
                ch.type === ChannelType.GuildForum
        ) as Collection<string, GuildChannel>;
    } catch (error) {
        console.error(`Failed to fetch all channels: ${error instanceof Error ? error.message : error}`);
        return new Collection();
    }
}

/**
 * Find a channel with improved search capabilities and error handling
 */
export async function findChannel(
    guild: Guild,
    query: string,
    options: {
        fuzzyThreshold?: number,
        caseSensitive?: boolean
    } = {}
): Promise<GuildChannel | null> {
    const {
        fuzzyThreshold = 0.4,
        caseSensitive = false
    } = options;

    if (!guild || !query) return null;

    try {
        // Direct ID lookup
        if (/^\d{17,19}$/.test(query)) {
            return await findChannelById(guild, query);
        }

        // Prepare search query
        const searchTerm = caseSensitive ? query : query.toLowerCase();

        return (await searchChannels(guild, searchTerm, {
            limit: 1,
            fuzzyThreshold,
            caseSensitive
        })).first() ?? null;

    } catch (error) {
        console.error(`Channel search error: ${error instanceof Error ? error.message : error}`);
        return null;
    }
}

/**
 * Enhanced channel formatting with more robust type handling
 */
export function formatChannels(channels: Collection<string, GuildChannel>): Array<{
    name: string;
    id: string;
    type: string;
    createdAt: Date;
    url: string;
    parentId?: string | null;
    topic?: string | null;
}> {
    return channels.map(channel => ({
        name: channel.name,
        id: channel.id,
        type: ChannelType[channel.type],
        createdAt: channel.createdAt,
        url: channel.url,
        parentId: channel.parentId,
        topic: 'topic' in channel ? (channel as any).topic : undefined
    }));
}

/**
 * Find a channel by its Discord Snowflake ID with improved error handling
 */
async function findChannelById(guild: Guild, id: string): Promise<GuildChannel | null> {
    try {
        const channel = await guild.channels.fetch(id as Snowflake);
        return channel instanceof GuildChannel ? channel : null;
    } catch {
        return null;
    }
}

/**
 * Advanced search function with configurable fuzzy matching
 */
async function searchChannels(
    guild: Guild,
    query: string,
    options: {
        limit?: number,
        fuzzyThreshold?: number,
        caseSensitive?: boolean
    } = {}
): Promise<Collection<string, GuildChannel>> {
    const {
        limit = 1,
        fuzzyThreshold = 0.4,
        caseSensitive = false
    } = options;

    if (!guild || !query) throw new Error("Guild and query are required");

    try {
        const channels = await getAllChannels(guild);
        if (!channels.size) return new Collection();

        // Enhanced filtering with more flexible matching
        const filtered = channels.filter(channel => {
            const name = caseSensitive ? channel.name : channel.name.toLowerCase();
            const searchTerm = caseSensitive ? query : query.toLowerCase();

            // Exact match
            if (name === searchTerm) return true;

            // Includes match
            if (name.includes(searchTerm)) return true;

            // Fuzzy matching with normalized distance
            const distance = levenshteinDistance(name, searchTerm);
            const maxLength = Math.max(name.length, searchTerm.length);
            const normalizedDistance = distance / maxLength;

            return normalizedDistance <= fuzzyThreshold;
        });

        return new Collection(Array.from(filtered.entries()).slice(0, limit));
    } catch (error) {
        console.error(`Channel search error for "${query}":`, error);
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