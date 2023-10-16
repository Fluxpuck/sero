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
        desc: {
            type: DataTypes.STRING,
            allowNull: true,
        }
    },
        {
            sequelize,
            modelName: 'commands',
            timestamps: true,
            createdAt: true,
            updatedAt: true,
        }, {
    });
    // → set help based on privacy of the command
    Commands.beforeSave(async (command, options) => {
        if (command.private === true) {
            // If private is true, set help to false
            command.help = false;
        } else if (command.private === false) {
            // If private is false, set help to true
            command.help = true;
        }
        // If private is null or undefined, help will remain as it is (true or false)
    });

    return Commands;
}