const { Model, DataTypes } = require('sequelize');
const { DISCORD_SNOWFLAKE } = require('../config/config');

class User extends Model {
    static associate(models) {
        this.belongsTo(models.Guild, { foreignKey: 'guildId' })
        this.hasMany(models.UserLevels, { foreignKey: 'userId' })
        this.hasMany(models.UserWallet, { foreignKey: 'userId' })
        this.hasMany(models.UserBank, { foreignKey: 'userId' })
        this.hasMany(models.UserCareers, { foreignKey: 'userId' })
        this.hasMany(models.Logs, { foreignKey: 'userId' })
        this.hasMany(models.Messages, { foreignKey: 'userId' })
        this.hasMany(models.Away, { foreignKey: 'userId' })
    }
}

module.exports = sequelize => {
    User.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: DISCORD_SNOWFLAKE
            }
        },
        userName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        guildId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: DISCORD_SNOWFLAKE
            }
        },
        moderator: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
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
        updatedAt: true,
        indexes: [
            {
                fields: ['userId', 'guildId'],
                unique: true,
            }
        ]
    });

    return User;
}