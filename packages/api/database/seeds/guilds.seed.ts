import { Guild } from "../../models";
import { logger } from "../../utils/logger";

const log = logger("guilds-seed");

export async function seedGuilds(): Promise<{
  success: boolean;
  error?: unknown;
  count?: number;
}> {
  const guilds = [
    {
      guildId: "660103319557111808",
      guildName: "Fluxpuck's Secret Society",
      premium: true,
    },
  ];

  try {
    await Guild.bulkCreate(guilds as Guild[], { individualHooks: true });
    log.success(`${guilds.length} guilds have been processed successfully.`);
    return { success: true, count: guilds.length };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    log.error(`Error seeding guilds: ${errorMessage}`);
    return { success: false, error };
  }
}
