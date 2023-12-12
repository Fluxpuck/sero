const { Model, DataTypes } = require('sequelize');

class EventChannels extends Model {
    static associate(models) {
        // this.belongsTo(models.Guild, { foreignKey: 'guildId' });
    }
}

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