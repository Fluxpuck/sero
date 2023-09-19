/* RESTFUL API for Flux
 Intented for Private use only
 Copyright © 2023
*/

// → Require sequelize
const { Model, DataTypes } = require('sequelize');

// → set assosiations with this Model
class EventChannels extends Model {
    static associate(models) {
        this.belongsTo(models.Guild, { foreignKey: 'guildId' });
    }
}

// → export Model
module.exports = sequelize => {
    EventChannels.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [[
                    'memberEvents',
                    'emojiEvents',
                    'roleEvents',
                    'messageEvents',
                    'stickerEvents',
                    'inviteEvents'
                ]],
            },
        },
        channelId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'eventchannels',
        timestamps: true,
        createdAt: true,
    }, {
        // Add a unique constraint on guildId and category to prevent multiple entries for the same category
        indexes: [
            {
                unique: true,
                fields: ['guildId', 'category'],
            },
        ],
    });

    return EventChannels;
}