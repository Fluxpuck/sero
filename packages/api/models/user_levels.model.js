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
            min: {
                args: [0],
                msg: 'Minimum value constraint violated.', // Error message
            },
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
            min: {
                args: [0],
                msg: 'Minimum value constraint violated.', // Error message if constraint is violated
            },
            max: {
                args: [5],
                msg: 'Maximum value constraint violated.', // Error message if constraint is violated
            },
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

        console.log("Checking for rank update...")

        const { LevelRanks } = require('../database/models');
        const userRank = await LevelRanks.findOne({
            where: {
                guildId: userLevel.guildId,
                level: userLevel.level
            }
        });

        console.log("userRank: ", userRank);

        // Update userLevel with the rank information if found
        if (userRank) {
            userLevel.rank = userRank.rank;
        }

        return userLevel;

    };

    UserLevels.beforeSave(async (userLevel) => {
        // Check if the user has reached a new level
        const newLevel = await updateLevels(userLevel);
        const hasLevelChanged = (
            userLevel.level !== newLevel.level ||
            userLevel.currentLevelExp !== newLevel.currentLevelExp ||
            userLevel.nextLevelExp !== newLevel.nextLevelExp ||
            userLevel.remainingExp !== newLevel.remainingExp
        );

        if (hasLevelChanged) {
            userLevel.set(newLevel);

            console.log("User's level has updated!")
        }

        // Update rank information if level has changed
        if (hasLevelChanged) {
            const newRank = await updateRank(userLevel);
            if (userLevel.rank !== newRank.rank) {
                userLevel.rank = newRank.rank;

                console.log("User's rank has updated!")

                // Send RabbitMQ message with the new rank information
                sendToQueue(EVENT_CODES.USER_RANK_UPDATE,
                    {
                        userId: userLevel.userId,
                        guildId: userLevel.guildId,
                        level: userLevel.level,
                        rank: userLevel.rank
                    });

                res.send('Message sent to RabbitMQ');

            }
        }
    });

    return UserLevels;
}
