const { Model, DataTypes, Op } = require('sequelize');
const EVENT_CODES = require('../config/EventCodes');
const { sendToQueue } = require('../database/publisher');

class UserLevels extends Model {
    static associate(models) {
        this.belongsTo(models.User, { foreignKey: { name: 'userId', allowNull: false } });
        this.belongsTo(models.Guild, { foreignKey: { name: 'guildId', allowNull: false } });
    }
}

module.exports = sequelize => {
    UserLevels.init({
        userId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        guildId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        experience: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: {
                    args: [0],
                    msg: 'Experience cannot be negative.',
                },
            }
        },
        level: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        rank: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        currentLevelExp: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        nextLevelExp: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 100
        },
        remainingExp: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 100
        },
        modifyer: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: {
                    args: [0],
                    msg: 'Modifyer cannot be 0'
                },
                max: {
                    args: [5],
                    msg: 'Modifyer cannot be greater than 5'
                },
            }
        },
        reward_claimed: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        }
    }, {
        sequelize,
        modelName: 'user_levels',
        timestamps: true,
        updatedAt: true,
        createdAt: true
    });


    const updateLevels = async (userLevel) => {

        const { Levels } = require('../database/models');
        const levels = await Levels.findAll({
            order: [['experience', 'ASC']],
        });

        // Find the previous level
        const previousLevel = levels
            .filter(level => level.experience <= userLevel.experience)
            .pop() || { level: 1, experience: 0 };

        // Find the next level
        const nextLevel = levels
            .find(level => level.experience > userLevel.experience) || { experience: Infinity };

        return {
            level: previousLevel.level,
            currentLevelExp: previousLevel.experience,
            nextLevelExp: nextLevel.experience,
            remainingExp: nextLevel.experience - userLevel.experience,
        };
    };

    const updateRank = async (userLevel) => {

        const { LevelRanks } = require('../database/models');
        const levelRanks = await LevelRanks.findAll({
            where: {
                guildId: userLevel.guildId
            },
            order: [['level', 'ASC']],
        });

        // Find the user's ranks
        const userRanks = levelRanks.filter(rank => rank.level <= userLevel.level);
        const userRank = userRanks.at(-1) || { level: 1 };

        // Get all guild available level rank rewards
        const availableRewards = levelRanks.map(rank => rank.roleId);

        return {
            rank: userRank.level,
            ranks: userRanks,
            rewards: availableRewards
        };
    };

    UserLevels.beforeSave(async (userLevel) => {
        // Check if the user has reached a new level
        const newLevel = await updateLevels(userLevel);

        const hasLevelChanged = userLevel.level !== newLevel.level;
        const hasExperienceChanged = (
            userLevel.currentLevelExp !== newLevel.currentLevelExp ||
            userLevel.nextLevelExp !== newLevel.nextLevelExp ||
            userLevel.remainingExp !== newLevel.remainingExp
        );

        if (hasExperienceChanged) {
            userLevel.set(newLevel);
        }

        // Update rank information if level has changed
        if (hasLevelChanged) {
            const newRank = await updateRank(userLevel);
            if (userLevel.rank !== newRank.rank) {
                userLevel.rank = newRank.rank;

                // Send RabbitMQ message with the new rank information
                sendToQueue(EVENT_CODES.USER_RANK_UPDATE,
                    {
                        guildId: userLevel.guildId,
                        userId: userLevel.userId,
                        userRanks: newRank.ranks,
                        guildRewards: newRank.rewards,
                    });
            }
        }
    });

    return UserLevels;
}
