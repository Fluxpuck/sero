/* RESTFUL API for Flux
 Intented for Private use only
 Copyright © 2023
*/

// → Require sequelize
const { Model, DataTypes } = require('sequelize');

// → set assosiations with this Model
class Commands extends Model {
    static associate(models) {
        this.belongsTo(models.Client, { foreignKey: 'clientId' });
    }
}

// → export Model
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
            allowNull: true,
        },
        commandName: {
            type: DataTypes.STRING,
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