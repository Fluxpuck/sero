/* RESTFUL API for Flux
 Intented for Private use only
 Copyright © 2023
*/

// → Require sequelize
const { Model, DataTypes } = require('sequelize');

// → set assosiations with this Model
class Messages extends Model {
    static associate(models) {
        this.belongsTo(models.User, { foreignKey: 'userKey' });
        this.belongsTo(models.Guild, { foreignKey: 'guildId' });
    }
}

// → export Model
module.exports = sequelize => {
    Messages.init({
        messageId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            unique: true,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        channelId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        }
    }, {
        sequelize,
        modelName: 'messages',
        timestamps: true,
        createdAt: true
    });
    return Messages;
}