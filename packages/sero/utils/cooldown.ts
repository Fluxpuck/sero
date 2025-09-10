import { Client } from "discord.js";

/**
 * Cooldown hook utility for managing user cooldowns
 */
export const useCooldown = (
  client: Client,
  guildId: string,
  userId: string,
  tag: string
) => {
  // Create a unique key for this cooldown
  const cooldownKey = `${userId}_${guildId}_${tag}`;

  /**
   * Check if the user is currently on cooldown
   * @returns boolean - Whether the user is on cooldown
   */
  const onCooldown = (): boolean => {
    return client.cooldowns.has(cooldownKey);
  };

  /**
   * Get the remaining time left on the cooldown in seconds
   * @returns number - Time left in seconds, or 0 if not on cooldown
   */
  const timeLeft = (): number => {
    if (!onCooldown()) return 0;

    const expirationTime = client.cooldowns.get<number>(cooldownKey);
    if (!expirationTime) return 0;

    const timeRemaining = Math.ceil((expirationTime - Date.now()) / 1000);
    return timeRemaining > 0 ? timeRemaining : 0;
  };

  /**
   * Execute a function if not on cooldown, and set a new cooldown
   * @param fn - The function to execute
   * @param cooldownDuration - The cooldown duration in seconds
   * @returns The result of the function, or null if on cooldown
   */
  const executable = <T>(fn: () => T, cooldownDuration: number): T | null => {
    if (onCooldown()) return null;

    // Execute the function
    const result = fn();

    // Set the cooldown
    const expirationTime = Date.now() + cooldownDuration * 1000;
    client.cooldowns.set(cooldownKey, expirationTime, cooldownDuration);

    return result;
  };

  /**
   * Set a cooldown for the user
   * @param cooldownDuration - The cooldown duration in seconds
   * @returns boolean - Whether the cooldown was set
   */
  const setCooldown = (cooldownDuration: number): boolean => {
    // Check if already on cooldown
    if (onCooldown()) {
      return false;
    }

    // Set the cooldown
    const expirationTime = Date.now() + cooldownDuration * 1000;
    client.cooldowns.set(cooldownKey, expirationTime, cooldownDuration);
    return true;
  };

  /**
   * Clear the cooldown for the user
   * @returns boolean - Whether the cooldown was cleared
   */
  const clearCooldown = (): boolean => {
    if (!onCooldown()) return false;
    return client.cooldowns.del(cooldownKey) > 0;
  };

  return {
    onCooldown,
    timeLeft,
    executable,
    setCooldown,
    clearCooldown,
  };
};
