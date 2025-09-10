import { LevelRank } from "../../models";
import { logger } from "../../utils/logger";

export async function seedRanks(): Promise<{
  success: boolean;
  error?: unknown;
  count?: number;
}> {
  const ranks = [
    {
      guildId: "660103319557111808",
      level: 1,
      roleId: "1243525019380875284",
    },
    {
      guildId: "660103319557111808",
      level: 5,
      roleId: "1243525174217670656",
    },
    {
      guildId: "660103319557111808",
      level: 10,
      roleId: "1243525189908566076",
    },
  ];

  try {
    await LevelRank.bulkCreate(ranks as LevelRank[], { individualHooks: true });
    logger.success(`${ranks.length} ranks have been processed successfully.`);
    return { success: true, count: ranks.length };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error seeding ranks: ${errorMessage}`);
    return { success: false, error };
  }
}
