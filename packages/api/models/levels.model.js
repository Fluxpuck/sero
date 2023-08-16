/* RESTFUL API for Flux
 Intented for Private use only
 Copyright © 2023
*/

// → Require sequelize
const { Model, DataTypes } = require('sequelize');
const { calculateLevel } = require('../utils/levelManager');

// → set assosiations with this Model
class Levels extends Model {
    static associate(models) {
        this.belongsTo(models.User, { foreignKey: 'userKey', otherKey: 'userId' });
        this.belongsTo(models.Guild, { foreignKey: 'guildId' });
    }
}

// → export Model
module.exports = sequelize => {
    Levels.init({
        levelId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false
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
        modelName: 'Levels',
        timestamps: true,
        updatedAt: true,
        createdAt: true
    });
    // → calculate the level from the experience
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

