import { UserLevel } from "../models/user-levels.model";
import { LevelRank } from "../models/level-ranks.model";
import { Level } from "../models/levels.model";
import { Op } from 'sequelize';

const BASE_EXP = 15;
const MAX_EXP = 25;

/**
 * Calculates the experience points for a user
 * @param personalModifier The personal modifier for the user
 * @param serverModifier The server modifier for the user
 * @returns The calculated experience points
 */
export const calculateXp = (personalModifier = 1, serverModifier = 1) => {
    return Math.ceil(
        Math.random() * (MAX_EXP - BASE_EXP + 1) + BASE_EXP
    ) * serverModifier * personalModifier;
}

/**
 * Calculates the level, current experience, and remaining experience for a user
 * @param userLevel The user's level
 * @returns An object containing the level, current experience, and remaining experience
 */
export const calculateLevel = async (userLevel: UserLevel) => {
    const [previousLevel, nextLevel] = await Level.findAll({
        order: [['experience', 'ASC']],
        where: {
            experience: {
                [Op.between]: [userLevel.experience - 1, userLevel.experience + 1],
            },
        },
    });

    return {
        level: previousLevel?.level ?? 1,
        currentLevelExp: previousLevel?.experience ?? 0,
        nextLevelExp: nextLevel?.experience ?? Infinity,
        remainingExp: nextLevel?.experience ? nextLevel.experience - userLevel.experience : 0,
    };
}

/**
 * Calculates the rank and rewards for a user
 * @param userLevel The user's level
 * @returns An object containing the rank, ranks, and rewards
 */
export const calculateRank = async (userLevel: UserLevel) => {
    const [userRank, ...userRanks] = await LevelRank.findAll({
        where: {
            guildId: userLevel.guildId,
        },
        order: [['level', 'DESC']],
    });

    return {
        rank: userRank?.level ?? 1,
        ranks: userRanks,
        rewards: await LevelRank.findAll({
            where: {
                guildId: userLevel.guildId,
            },
            order: [['level', 'ASC']],
        }),
    };

}