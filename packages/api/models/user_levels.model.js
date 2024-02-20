const { Model, DataTypes } = require('sequelize');
const { calculateLevel } = require('../utils/levelManager');

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

    UserLevels.beforeSave(async (level, options) => {
        let exp = level.getDataValue('experience');
        let calculatedLevel = calculateLevel(exp);
        level.setDataValue('level', calculatedLevel.level);
        level.setDataValue('currentLevelExp', calculatedLevel.currentLevelExp);
        level.setDataValue('nextLevelExp', calculatedLevel.nextLevelExp);
        level.setDataValue('remainingExp', calculatedLevel.remainingExp);
    });

    return UserLevels;
}

