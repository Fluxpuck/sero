import { Collection, Snowflake, Guild, GuildChannel, ChannelType } from "discord.js";

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
 * Find a channel by its Discord Snowflake ID
 */
async function findChannelById(guild: Guild, id: string): Promise<GuildChannel | null> {
    const channel = await guild.channels.fetch(id as Snowflake);
    return channel instanceof GuildChannel ? channel : null;
}

/**
 * Advanced search function for finding channels by name
 * Could return multiple potential matches instead of just one
 */
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
            return name.includes(searchTerm);
        });

        // Take only the first 'limit' entries
        return new Collection(Array.from(filtered.entries()).slice(0, limit));

    } catch (error) {
        console.error(`Error searchChannels "${query}":`, error);
        return new Collection();
    }
}
