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
    const [previousLevel, nextLevel] = await Promise.all([
        Level.findOne({
            where: { experience: { [Op.lte]: userLevel.experience } },
            order: [['experience', 'DESC']],
        }),
        Level.findOne({
            where: { experience: { [Op.gt]: userLevel.experience } },
            order: [['experience', 'ASC']],
        }),
    ]);

    return {
        level: previousLevel?.level ?? 1,
        currentLevelExp: previousLevel?.experience ?? 0,
        nextLevelExp: nextLevel?.experience ?? 0,
        remainingExp: nextLevel?.experience ? nextLevel.experience - userLevel.experience : 0,
    };
}

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
            order: [['level', 'DESC']],
        }),
        LevelRank.findAll({
            where: { guildId: userLevel.guildId },
            order: [['level', 'ASC']],
        }),
    ]);

    // Find all ranks that are same or lower as userLevel
    const rewards = await LevelRank.findAll({
        where: {
            guildId: userLevel.guildId,
            level: { [Op.lte]: userLevel.level },
        },
        order: [['level', 'ASC']],
    });

    return {
        rank: userRank?.level ?? 1,
        ranks,
        rewards,
    };

}
