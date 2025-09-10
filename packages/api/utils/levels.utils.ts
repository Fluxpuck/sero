import { UserLevel } from "../models/user-levels.model";
import { LevelRank } from "../models/level-ranks.model";
import { Level } from "../models/levels.model";
import {
  UserExperienceLogs,
  UserExperienceLogType,
} from "../models/user-experience-logs.model";
import { Op } from "sequelize";
import { addDays, startOfDay } from "date-fns";

const DAILY_TRANSFER_LIMIT = 2000;
const BASE_EXP = 15;
const MAX_EXP = 25;

/**
 * Calculates the experience points for a user
 * @param personalModifier The personal modifier for the user
 * @param serverModifier The server modifier for the user
 * @returns The calculated experience points
 */
export const calculateXp = (personalModifier = 1, serverModifier = 1) => {
  return (
    Math.ceil(Math.random() * (MAX_EXP - BASE_EXP + 1) + BASE_EXP) *
    serverModifier *
    personalModifier
  );
};

/**
 * Calculates the level, current experience, and remaining experience for a user
 * @param userLevel The user's level
 * @returns An object containing the level, current experience, and remaining experience
 */
export const calculateLevel = async (userLevel: UserLevel) => {
  const [previousLevel, nextLevel] = await Promise.all([
    Level.findOne({
      where: { experience: { [Op.lte]: userLevel.experience } },
      order: [["experience", "DESC"]],
    }),
    Level.findOne({
      where: { experience: { [Op.gt]: userLevel.experience } },
      order: [["experience", "ASC"]],
    }),
  ]);

  return {
    level: previousLevel?.level ?? 1,
    currentLevelExp: previousLevel?.experience ?? 0,
    nextLevelExp: nextLevel?.experience ?? 0,
    remainingExp: nextLevel?.experience
      ? nextLevel.experience - userLevel.experience
      : 0,
  };
};

/**
 * Calculates the rank and rewards for a user
 * @param userLevel The user's level
 * @returns An object containing the rank, ranks, and rewards
 */
export const calculateRank = async (userLevel: UserLevel) => {
  const [userRank, ranks] = await Promise.all([
    LevelRank.findOne({
      where: {
        guildId: userLevel.guildId,
        level: { [Op.lte]: userLevel.level },
      },
      order: [["level", "DESC"]],
    }),
    LevelRank.findAll({
      where: { guildId: userLevel.guildId },
      order: [["level", "ASC"]],
    }),
  ]);

  // Find all ranks that are same or lower as userLevel
  const rewards = await LevelRank.findAll({
    where: {
      guildId: userLevel.guildId,
      level: { [Op.lte]: userLevel.level },
    },
    order: [["level", "ASC"]],
  });

  return {
    rank: userRank?.level ?? 1,
    ranks,
    rewards,
  };
};

/**
 * Checks if a user has exceeded their daily transfer limit
 */
export const checkDailyTransferLimit = async (
  guildId: string,
  userId: string,
  amount: number,
  transaction: any
) => {
  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);

  const dailyTransfers = await UserExperienceLogs.findAll({
    where: {
      guildId,
      userId,
      type: UserExperienceLogType.TRANSFER,
      createdAt: {
        [Op.gte]: today,
        [Op.lt]: tomorrow,
      },
    },
    transaction,
  });

  // Calculate total transferred today
  const totalTransferredToday = dailyTransfers.reduce(
    (sum, log) => sum + log.amount,
    0
  );

  // Calculate remaining limit for today
  const remainingLimit = Math.max(
    0,
    DAILY_TRANSFER_LIMIT - totalTransferredToday
  );

  // Determine actual transfer amount (capped by remaining limit)
  const actualTransferAmount = Math.min(amount, remainingLimit);

  // Calculate remaining limit after this transfer
  const remainingTransferLimit = remainingLimit - actualTransferAmount;

  // Check if transfer is possible
  const canTransfer = actualTransferAmount > 0;

  return {
    dailyTransferLimit: DAILY_TRANSFER_LIMIT,
    actualTransferAmount,
    remainingTransferLimit,
    canTransfer,
  };
};
