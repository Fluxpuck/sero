/* RESTFUL API for Flux
 Intented for Private use only
 Copyright © 2023
*/

// → Require sequelize
const { Model, DataTypes } = require('sequelize');

// → set assosiations with this Model
class ClientCommands extends Model {
    static associate(models) {
    }
}

// → export Model
module.exports = sequelize => {
    ClientCommands.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        commandId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        commandName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        private: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        help: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
    },
        {
            sequelize,
            modelName: 'clientcommands',
            timestamps: true,
            createdAt: true,
            updatedAt: true,
        }, {
    });
    // → set help based on privacy of the command
    ClientCommands.beforeSave(async (clientcommands, options) => {
        if (clientcommands.private === true) {
            clientcommands.help = false;  // If private is true, set help to false
        } else if (clientcommands.private === false) {
            clientcommands.help = true; // If private is false, set help to true
        }
        // If private is null or undefined, help will remain as it is (true or false)
    });

    return ClientCommands;
}