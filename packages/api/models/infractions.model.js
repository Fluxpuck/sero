/* RESTFUL API for Flux
 Intented for Private use only
 Copyright © 2023
*/

// → Require sequelize
const { Model, DataTypes } = require('sequelize');

// → set assosiations with this Model
class Infractions extends Model {
    static associate(models) {
        this.belongsTo(models.Guild, { foreignKey: 'guildId' });
        this.belongsTo(models.User, { foreignKey: 'userKey' });
    }
}

// → export Model
module.exports = sequelize => {
    Infractions.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
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
        modelName: 'infractions',
        timestamps: true,
        createdAt: true
    });

    return Infractions;
}