const { getRequest } = require("../../database/connection");
const { RedisCache } = require("../../database/redisCache");

const GUILD_PREMIUM_PREFIX = "guild:premium:";
const CACHE_TTL = 60; // 60 seconds

async function hasPremium(guildId) {
  // Set the cache key
  const cacheKey = `${GUILD_PREMIUM_PREFIX}${guildId}`;

  const cachedStatus = await RedisCache.get(cacheKey);
  if (cachedStatus !== null) {
    return cachedStatus;
  }

  // If not in cache, fetch from API
  const guildResult = await getRequest(`/guild/${guildId}`);
  const hasPremium = guildResult?.data?.premium || false;
  await RedisCache.set(cacheKey, hasPremium, CACHE_TTL);

  return hasPremium;
}

module.exports = { hasPremium };
