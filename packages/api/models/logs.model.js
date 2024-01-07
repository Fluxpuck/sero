const { Model, DataTypes } = require('sequelize');
const { SnowflakeUtil } = require('discord.js');

class Logs extends Model {
    static associate(models) {
        // this.belongsTo(models.Guild, { foreignKey: 'guildId' });
        // this.belongsTo(models.User, { foreignKey: 'userHash' });
    }
}

module.exports = sequelize => {
    Logs.init({
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            unique: true,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        auditAction: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        auditType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        auditCategory: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        guildId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        targetId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        executorId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: true,
        }
    }, {
        sequelize,
        modelName: 'logs',
        timestamps: true,
        createdAt: true,
        updatedAt: true
    });

    return Logs;
}