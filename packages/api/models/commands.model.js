const { Model, DataTypes } = require('sequelize');
const { DISCORD_SNOWFLAKE } = require('../config/config');

class Commands extends Model {
    static associate(models) {
    }
}

module.exports = sequelize => {
    Commands.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        commandId: {
            type: DataTypes.BIGINT,
            unique: true,
            allowNull: true,
            validate: {
                is: DISCORD_SNOWFLAKE
            }
        },
        commandName: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        usage: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        interactionType: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        },
        interactionOptions: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        defaultMemberPermissions: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        cooldown: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        private: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        },
    },
        {
            sequelize,
            modelName: 'commands',
            timestamps: true,
            createdAt: true,
            updatedAt: true,
            indexes: [
                {
                    fields: ['commandId'],
                    unique: true,
                },
                {
                    fields: ['commandName'],
                    unique: true,
                }
            ],
        }, {
    });

    return Commands;
}