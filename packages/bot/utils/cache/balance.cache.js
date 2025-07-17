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
        // Map wallet/bank type to the corresponding field name in the API
        const sortBy = type === 'wallet' ? 'wallet_balance' : 'bank_balance';
        
        // Use the new API route structure
        const balanceResult = await getRequest(`/guild/${guildId}/economy/balance?sortBy=${sortBy}&order=DESC`);
        
        if (!balanceResult?.data) {
            throw new Error('Failed to fetch leaderboard data');
        }

        // Process the data to match the expected format
        const data = balanceResult.data.map(user => ({
            userId: user.userId,
            userName: user.userId, // We'll need to fetch usernames separately
            balance: user[sortBy]
        }));

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