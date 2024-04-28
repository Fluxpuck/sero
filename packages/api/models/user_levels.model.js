const { Model, DataTypes, Op } = require('sequelize');

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
            min: 0,
        },
        level: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            min: 0
        },
        rank: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            min: 1,
            max: 100
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
            defaultValue: 1
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

        const previousLevel = await Levels.findOne({
            where: { experience: { [Op.lt]: userLevel.experience } },
            order: [['experience', 'DESC']],
            limit: 1
        });

        const nextLevel = await Levels.findOne({
            where: { experience: { [Op.gt]: userLevel.experience } },
            order: [['experience', 'ASC']],
            limit: 1
        });

        // if there is no previous or next level, return the userLevel as is
        if (!previousLevel || !nextLevel) return userLevel;

        // Update the userLevel data
        userLevel.level = previousLevel ? previousLevel.level : 1;
        userLevel.currentLevelExp = previousLevel ? previousLevel.experience : 0;
        userLevel.nextLevelExp = nextLevel.experience;
        userLevel.remainingExp = nextLevel.experience - userLevel.experience;

        return userLevel;
    };

    const updateRank = async (userLevel) => {

        const { LevelRewards } = require('../database/models');

        const userRank = await LevelRewards.findOne({
            where: {
                guildId: userLevel.guildId,
                level: userLevel.level
            }
        });

        // if there is no level Reward, return the userLevel as is
        if (!userRank) return userLevel;

        // Update the userLevel data
        userLevel.rank = userRank.rankId;

        return userLevel;
    };

    UserLevels.beforeSave(async (userLevel, options) => {
        // Check if the level needs to be updated
        const newLevel = await updateLevels(userLevel);
        if ( // if any of the level information has changed
            userLevel.level !== newLevel.level ||
            userLevel.currentLevelExp !== newLevel.currentLevelExp ||
            userLevel.nextLevelExp !== newLevel.nextLevelExp ||
            userLevel.remainingExp !== newLevel.remainingExp
        ) { // Set the new level information
            userLevel.set({
                level: newLevel.level,
                currentLevelExp: newLevel.currentLevelExp,
                nextLevelExp: newLevel.nextLevelExp,
                remainingExp: newLevel.remainingExp
            });

            // Check if the rank needs to be updated
            const newRank = await updateRank(userLevel);
            if (userLevel.rank !== newRank.rank) {
                userLevel.set({
                    rank: newRank.rank
                });
            }

            // Save the changes to the database
            await userLevel.save();
        }
    });

    return UserLevels;
}

