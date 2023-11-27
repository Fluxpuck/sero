const { Model, DataTypes } = require('sequelize');

class Commands extends Model {
    static associate(models) {
    }
}

module.exports = sequelize => {
    Commands.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            unique: true,
            autoIncrement: true,
        },
        commandId: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: true,
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