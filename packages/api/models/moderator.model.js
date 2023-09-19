/* RESTFUL API for Flux
 Intented for Private use only
 Copyright © 2023
*/

// → Require sequelize
const { Model, DataTypes } = require('sequelize');

// → set assosiations with this Model
class Moderator extends Model {
    static associate(models) {
        this.belongsTo(models.Guild, { foreignKey: 'guildId' });
        this.belongsTo(models.User, { foreignKey: 'userKey' });
    }
}

// → export Model
module.exports = sequelize => {
    Moderator.init({
        moderatorId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        location: {
            type: DataTypes.STRING,
            allowNull: true
        },
        language: {
            type: DataTypes.STRING,
            allowNull: true
        },
        rank: {
            type: DataTypes.STRING,
            allowNull: true
        },
    }, {
        sequelize,
        modelName: 'moderator',
        timestamps: true,
        updatedAt: true,
        createdAt: true
    });
    return Moderator;
}