const { Model, DataTypes, Op } = require('sequelize');
const { publishMessage, REDIS_CHANNELS } = require('../database/publisher');

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
                max: {
                    args: [4_950_000],
                    msg: 'Experience cannot be greater than 4,950,000 (Max Level)'
                }
            },
            set(value) {
                if (value < 0) {
                    this.setDataValue('experience', 0);
                } else {
                    this.setDataValue('experience', value);
                }
            },
        },
        level: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
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
        modifier: {
            type: DataTypes.FLOAT,
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
            allowNull: false,
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

        // Get level data in one query with conditions
        const [previousLevel, nextLevel] = await Promise.all([
            Levels.findOne({
                where: {
                    experience: {
                        [Op.lte]: userLevel.experience
                    }
                },
                order: [['experience', 'DESC']],
            }),
            Levels.findOne({
                where: {
                    experience: {
                        [Op.gt]: userLevel.experience
                    }
                },
                order: [['experience', 'ASC']],
            })
        ]);

        // Use default values if no levels found
        const currentLevel = previousLevel || { level: 1, experience: 0 };
        const futureLevel = nextLevel || { experience: 4_950_000 };

        return {
            level: currentLevel.level,
            currentLevelExp: currentLevel.experience,
            nextLevelExp: futureLevel.experience,
            remainingExp: futureLevel.experience - userLevel.experience,
        };
    };

    const updateRank = async (userLevel) => {
        const { LevelRanks } = require('../database/models');

        // Get all level ranks
        const levelRanks = await LevelRanks.findAll({
            where: {
                guildId: userLevel.guildId
            },
            order: [['level', 'ASC']],
        });

        // Find the user's ranks
        const userRanks = levelRanks.filter(rank => rank.level <= userLevel.level);
        const userRank = userRanks.at(-1) || { level: 1 };

        return {
            rank: userRank.level,
            ranks: userRanks,
            rewards: levelRanks
        };
    };

    UserLevels.beforeSave(async (userLevel) => {
        if (!userLevel.changed('experience')) return;

        // Update level and rank in parallel
        const [newLevel, newRank] = await Promise.all([
            updateLevels(userLevel),
            updateRank(userLevel)
        ]);

        const hasLevelChanged = userLevel.level !== newLevel.level;
        const hasExperienceChanged =
            userLevel.currentLevelExp !== newLevel.currentLevelExp ||
            userLevel.nextLevelExp !== newLevel.nextLevelExp ||
            userLevel.remainingExp !== newLevel.remainingExp;

        if (hasExperienceChanged) {
            userLevel.set(newLevel);
        }

        if (hasLevelChanged) {
            userLevel.rank = newRank.rank;
        }

        publishMessage(REDIS_CHANNELS.RANK, {
            guildId: userLevel.guildId,
            userId: userLevel.userId,
            userRankRewards: newRank.ranks,
            allRankRewards: newRank.rewards,
        });
    });

    return UserLevels;
}
