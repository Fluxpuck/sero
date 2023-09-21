/* RESTFUL API for Flux
 Intented for Private use only
 Copyright © 2023
*/

// → Require sequelize
const { Model, DataTypes } = require('sequelize');

// → set assosiations with this Model
class Moderator extends Model {
    static associate(models) {
        this.belongsToMany(models.Guild, {
            through: 'ModeratorAssociation', // Name of the shared intermediary table
            foreignKey: 'moderatorId', // This should match the foreign key in the Moderator model
            otherKey: 'guildId', // Foreign key for the Guild model
        });
        this.belongsToMany(models.User, {
            through: 'ModeratorAssociation', // Name of the shared intermediary table
            foreignKey: 'moderatorId', // This should match the foreign key in the Moderator model
            otherKey: 'guildId', // Foreign key for the Guild model
        });
        this.belongsTo(models.User, {
            foreignKey: 'userKey', // This should match the foreign key in the User model (userKey)
            targetKey: 'userKey', // This should match the target key in the User model (userKey)
        });
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