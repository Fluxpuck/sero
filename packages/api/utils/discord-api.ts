import axios from "axios";
import { logger } from "./logger";

/**
 * Fetches a user's username from Discord API
 * @param userId The Discord user ID
 * @returns {string | null} The Discord username
 */
export async function fetchUsername(userId: string): Promise<string | null> {
  try {
    const response = await axios.get(
      `https://discord.com/api/v10/users/${userId}`,
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
        },
      }
    );

    return response.data.username;
  } catch (error) {
    logger.error(`Error fetching username for user ${userId}:`, error);
    return null;
  }
}

/**
 * Fetches a guild's name from Discord API
 * @param guildId The Discord guild ID
 * @returns {string | null} The Discord guild name
 */
export async function fetchGuildName(guildId: string): Promise<string | null> {
  try {
    const response = await axios.get(
      `https://discord.com/api/v10/guilds/${guildId}`,
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
        },
      }
    );

    return response.data.name;
  } catch (error) {
    logger.error(`Error fetching guild name for guild ${guildId}:`, error);
    return null;
  }
}
