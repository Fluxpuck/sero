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

        // Update the userLevel data
        userLevel.level = previousLevel.level;
        userLevel.currentLevelExp = previousLevel.experience;
        userLevel.nextLevelExp = nextLevel.experience;
        userLevel.remainingExp = nextLevel.experience - userLevel.experience;

        return userLevel;
    };

    UserLevels.beforeSave(async (userLevel, options) => {
        // Check if the level needs to be updated
        const newLevel = await updateLevels(userLevel);
        if (
            userLevel.level !== newLevel.level ||
            userLevel.currentLevelExp !== newLevel.currentLevelExp ||
            userLevel.nextLevelExp !== newLevel.nextLevelExp ||
            userLevel.remainingExp !== newLevel.remainingExp
        ) {
            // Set the new level information
            userLevel.set({
                level: newLevel.level,
                currentLevelExp: newLevel.currentLevelExp,
                nextLevelExp: newLevel.nextLevelExp,
                remainingExp: newLevel.remainingExp
            });

            // Save the changes to the database
            await userLevel.save();
        }
    });




    return UserLevels;
}

