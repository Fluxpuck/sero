const { Model, DataTypes } = require('sequelize');
const { calculateLevel } = require('../utils/levelManager');

class Levels extends Model {
    static associate(models) {
        // this.belongsTo(models.User, { foreignKey: 'userHash', otherKey: 'userId' });
        // this.belongsTo(models.Guild, { foreignKey: 'guildId' });
    }
}

module.exports = sequelize => {
    Levels.init({
        levelId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        guildId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        experience: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        level: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
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
        modelName: 'levels',
        timestamps: true,
        updatedAt: true,
        createdAt: true
    });

    Levels.beforeSave(async (level, options) => {
        let exp = level.getDataValue('experience');
        let calculatedLevel = calculateLevel(exp);
        level.setDataValue('level', calculatedLevel.level);
        level.setDataValue('currentLevelExp', calculatedLevel.currentLevelExp);
        level.setDataValue('nextLevelExp', calculatedLevel.nextLevelExp);
        level.setDataValue('remainingExp', calculatedLevel.remainingExp);
    });

    return Levels;
}

