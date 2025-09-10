import { Level } from "../../models";
import { logger } from "../../utils/logger";

const log = logger("levels-seed");

// Define the total number of levels and experience points for the first and last levels
const TOTAL_LEVELS = 100;
const FIRST_LEVEL_EXP = 100;
const LAST_LEVEL_EXP = 2000000;

// Exponential function to calculate experience points
function calculateExp(level: number) {
  const exp =
    FIRST_LEVEL_EXP +
    (LAST_LEVEL_EXP - FIRST_LEVEL_EXP) *
      Math.pow((level - 1) / (TOTAL_LEVELS - 1), 2);
  return Math.round(exp);
}

export async function seedLevels(): Promise<{
  success: boolean;
  error?: unknown;
}> {
  // Generate experience points for each level
  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => {
    const level = i + 1;
    const experience = calculateExp(level);
    return { level, experience };
  });

  try {
    await Level.bulkCreate(levels as Level[]);
    log.success(`${levels.length} levels have been seeded successfully.`);
    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    log.error(`Error seeding levels: ${errorMessage}`);
    return { success: false, error };
  }
}
