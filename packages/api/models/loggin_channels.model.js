const { Model, DataTypes } = require('sequelize');

class LogChannels extends Model {
    static associate(models) {
    }
}

module.exports = sequelize => {
    LogChannels.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        guildId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        channelId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: true,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
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
    }, {
        sequelize,
        modelName: 'logging_channels',
        timestamps: true,
        createdAt: true,
    }, {
        /* Add a unique constraint on guildId and category
        This to prevent multiple entries for the same combination */
        indexes: [
            {
                unique: true,
                fields: ['guildId', 'category'],
            },
        ],
    });

    return LogChannels;
}