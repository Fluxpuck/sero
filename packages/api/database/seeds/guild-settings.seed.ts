import { GuildSettings } from "../../models";
import { logger } from "../../utils/logger";

export async function seedGuildSettings(): Promise<{
  success: boolean;
  error?: unknown;
  count?: number;
}> {
  const guildSettings = [
    {
      guildId: "660103319557111808",
      type: "exp-reward-drop-channel",
      targetId: "660104519031717896",
    },
    {
      guildId: "660103319557111808",
      type: "birthday-channel",
      targetId: "660104519031717896",
    },
    {
      guildId: "660103319557111808",
      type: "birthday-role",
      targetId: "1413583976278262021",
    },
  ];

  try {
    await GuildSettings.bulkCreate(guildSettings as GuildSettings[]);
    logger.success(
      `${guildSettings.length} guilds-settings have been processed successfully.`
    );
    return { success: true, count: guildSettings.length };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error seeding guilds-settings: ${errorMessage}`, error);
    return { success: false, error };
  }
}
