/* RESTFUL API for Flux
 Intented for Private use only
 Copyright © 2023
*/

// → Require sequelize
const { Model, DataTypes } = require('sequelize');
const { generateUniqueToken } = require('../utils/FunctionManager');

// → set assosiations with this Model
class User extends Model {
    static associate(models) {
        this.belongsTo(models.Guild, { foreignKey: 'guildId' });
        this.belongsToMany(models.Guild, { through: models.Moderator, as: 'guilds', foreignKey: 'userKey' });
        this.hasMany(models.Messages, { foreignKey: 'userId' });
        this.hasMany(models.Infractions, { foreignKey: 'userId' });
    }
}

// → export Model
module.exports = sequelize => {
    User.init({
        userKey: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
            unique: true,
            defaultValue: () => {
                // Generate a unique token
                return generateUniqueToken();
            }
        },
        userName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'User',
        timestamps: true,
        createdAt: true
    });
    return User;
}