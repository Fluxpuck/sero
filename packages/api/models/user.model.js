/* RESTFUL API for Flux
 Intented for Private use only
 Copyright © 2023
*/

// → Require sequelize
const { Model, DataTypes } = require('sequelize');
const { generateUniqueHash } = require('../utils/FunctionManager');

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
            unique: true,
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
        modelName: 'user',
        timestamps: true,
        createdAt: true,
        hooks: {
            beforeCreate: async (user, options) => {
                // Generate a unique token for userKey based on userId
                user.userKey = generateUniqueHash(user.userId, user.guildId);

                // Check if a user with the same guildId and userId already exists
                const existingUser = await User.findOne({
                    where: {
                        guildId: user.guildId,
                        userId: user.userId,
                    },
                });

                if (existingUser) {
                    throw new Error('User with the same guildId and userId already exists.');
                }
            },
        },
    });


    return User;
}