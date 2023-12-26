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
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            defaultValue: () => SnowflakeUtil.generate(),
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
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
        },
    }, {
        sequelize,
        modelName: 'logs',
        timestamps: true,
        createdAt: true,
        updatedAt: true
    });

    return Logs;
}