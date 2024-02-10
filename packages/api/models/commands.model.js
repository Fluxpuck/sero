const { Model, DataTypes } = require('sequelize');

class Commands extends Model {
    static associate(models) {
    }
}

module.exports = sequelize => {
    Commands.init({
        commandId: {
            type: DataTypes.BIGINT,
            unique: true,
            allowNull: true,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        commandName: {
            type: DataTypes.STRING,
            primaryKey: true,
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
        }, {
    });

    return Commands;
}