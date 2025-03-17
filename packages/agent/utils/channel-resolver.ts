import { Collection, Snowflake, Guild, GuildChannel, ChannelType } from "discord.js";

/**
 * Get all channels in a guild
 */
export async function getAllChannels(guild: Guild): Promise<Collection<string, GuildChannel>> {
    await guild.channels.fetch();

    try {
        // Filter only text and voice channels
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
        console.error(`Error getAllChannels: ${error}`);
        return new Collection();
    }
}

/**
 * Find a channel by its name or ID
 */
export async function findChannel(
    guild: Guild,
    query: string,
): Promise<GuildChannel | null> {
    if (!guild || !query) return null;

    try {
        // Check if query is a channel ID and try to fetch directly
        if (/^\d{17,19}$/.test(query)) {
            return findChannelById(guild, query).catch(() => null);
        }

        return (await searchChannels(guild, query, 1)).first() ?? null;
    } catch (error) {
        console.error(`Error findChannel: ${error}`);
        return null;
    }
}

/**
 * Format all channels into a more readable format
 */
export function formatAllChannel(channels: Collection<string, GuildChannel>): any[] {
    return channels.map((channel: any) => {
        return {
            name: channel.name,
            id: channel.id,
            about: channel.topic,
            parentId: channel.parentId,
            channelPosition: channel.rawPosition,
            rateLimitPerUser: channel.rateLimitPerUser,
            type: ChannelType[channel.type],
            createdAt: channel.createdAt ?? channel.messages.channel.createdAt,
            link: channel.url ?? channel.messages.channel.url
        }
    });
}



// Find a channel by its Discord Snowflake ID
async function findChannelById(guild: Guild, id: string): Promise<GuildChannel | null> {
    const channel = await guild.channels.fetch(id as Snowflake);
    return channel instanceof GuildChannel ? channel : null;
}

// Advanced search function for finding channels by name or fuzzy matching
async function searchChannels(
    guild: Guild,
    query: string,
    limit: number = 1
): Promise<Collection<string, GuildChannel>> {
    if (!guild || !query) throw new Error("Guild and query required");

    try {
        const channels = await getAllChannels(guild);
        if (!channels) return new Collection();

        // Filter channels based on name matching
        const filtered = channels.filter(channel => {
            const name = channel.name.toLowerCase();

            const searchTerm = query.toLowerCase();

            // Check for direct includes first
            if (name.includes(searchTerm)) return true;

            // Calculate Levenshtein distance for fuzzy matching
            const distance = levenshtein(name, searchTerm);

            // Allow matches within 3 characters of difference, adjusted for length
            const threshold = Math.min(3, Math.floor(searchTerm.length * 0.4));
            return distance <= threshold;
        });

        // Take only the first 'limit' entries
        return new Collection(Array.from(filtered.entries()).slice(0, limit));

    } catch (error) {
        console.error(`Error searchChannels "${query}":`, error);
        return new Collection();
    }
}

// Function to calculate the Levenshtein distance between two strings
function levenshtein(a: string, b: string): number {
    const matrix: number[][] = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j++) {
        for (let i = 1; i <= a.length; i++) {
            const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[j][i] = Math.min(
                matrix[j][i - 1] + 1,
                matrix[j - 1][i] + 1,
                matrix[j - 1][i - 1] + substitutionCost
            );
        }
    }
    return matrix[b.length][a.length];
}