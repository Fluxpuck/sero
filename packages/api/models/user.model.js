const { Model, DataTypes } = require('sequelize');
const { generateUniqueHash } = require('../utils/FunctionManager');

class User extends Model {
    static associate(models) {
        // this.belongsTo(models.Guild, { foreignKey: 'guildId' });
        // this.hasMany(models.Messages, { foreignKey: 'userId' });
        // this.hasMany(models.AuditLogs, { foreignKey: 'userId' });
    }
}

module.exports = sequelize => {
    User.init({
        userHash: {
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
        guildId: {
            type: DataTypes.STRING,
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

                // Generate a unique token for userHash based on userId
                user.userHash = generateUniqueHash(user.userId, user.guildId);
            },
        },
    });

    return User;
}