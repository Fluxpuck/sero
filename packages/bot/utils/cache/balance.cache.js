const { getRequest } = require("../../database/connection");
const { RedisCache, CACHE_CONFIG } = require("../../database/redisCache");

const CACHE_KEY_PREFIX = CACHE_CONFIG.PREFIXES.GUILD_BALANCE;
const CACHE_TTL = 300; // 5 minutes

async function getCachedLeaderboardData(guildId, type) {
    const cacheKey = `${CACHE_KEY_PREFIX}${type}:leaderboard:${guildId}`;

    // Try to get from cache first
    const cachedData = await RedisCache.get(cacheKey);
    if (cachedData !== null) {
        return cachedData;
    }

    // If not in cache, fetch from API
    try {
        const balanceResult = await getRequest(`/guilds/${guildId}/economy/balance?limit=100&type=${encodeURIComponent(type)}`);
        if (balanceResult?.status !== 200) {
            throw new Error('Failed to fetch leaderboard data');
        }

        const data = balanceResult?.data ?? [];

        // Cache the result
        await RedisCache.set(cacheKey, data, CACHE_TTL);

        return data;
    } catch (error) {
        console.error('[Balance Cache Error]:', error);
        return null;
    }
}

async function invalidateLeaderboardCache(guildId, type = "both") {
    const types = type === "both" ? ["wallet", "bank"] : [type];
    for (const t of types) {
        const cacheKey = `${CACHE_KEY_PREFIX}${t}:leaderboard:${guildId}`;
        await RedisCache.delete(cacheKey);
    }
}

module.exports = {
    getCachedLeaderboardData,
    invalidateLeaderboardCache
};