const { getRequest } = require("../../database/connection");
const { RedisCache } = require("../../database/redisCache");

const GUILD_ACTIVE_PREFIX = 'guild:active:';
const CACHE_TTL = 3600; // 1 hour

async function getGuildActiveStatus(guildId) {

    // Set the cache key
    const cacheKey = `${GUILD_ACTIVE_PREFIX}${guildId}`;

    // Try cache first
    const cachedStatus = await RedisCache.get(cacheKey);
    if (cachedStatus !== null) {
        return cachedStatus;
    }

    // If not in cache, fetch from API
    const guildResult = await getRequest(`/guilds/${guildId}`);
    const isActive = guildResult?.status === 200 && guildResult?.data?.active === true;

    // Cache the result
    await RedisCache.set(cacheKey, isActive, CACHE_TTL);

    return isActive;
}

module.exports = { getGuildActiveStatus };