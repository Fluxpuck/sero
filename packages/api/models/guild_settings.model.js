const { Model, DataTypes } = require('sequelize');
const { publishMessage, REDIS_CHANNELS } = require('../database/publisher');
const cron = require('node-cron');

class GuildSettings extends Model {
    static associate(models) {
        this.belongsTo(models.Guild, { foreignKey: 'guildId' })
    }
}

module.exports = sequelize => {
    GuildSettings.init({
        guildId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        type: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        channelId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
    }, {
        sequelize,
        modelName: 'guild_settings',
        timestamps: true,
        createdAt: true,
        updatedAt: true,
    });

    // Clean up expired records every hour
    cron.schedule('0 * * * *', async () => {
        try {
            // Find all records with type === 'exp-reward-drops'
            const dropGuilds = await GuildSettings.findAll({
                where: {
                    type: 'exp-reward-drops'
                }
            });

            // Iterate over the results and run publishMessage for each record
            dropGuilds.forEach(record => {

                // const MIN_HOUR = 5 * 60 * 1000; // 5 minutes in milliseconds
                // const MAX_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds
                const MIN_HOUR = 0; // 0 minutes in milliseconds
                const MAX_HOUR = 60 * 1000; // 1 minute in milliseconds

                // Calculate a random delay between MIN_HOUR and MAX_HOUR
                const randomDelay = Math.floor(Math.random() * (MAX_HOUR - MIN_HOUR)) + MIN_HOUR;

                // Execute the job
                setTimeout(() => {
                    publishMessage(REDIS_CHANNELS.DROP, {
                        guildId: record.guildId,
                        channelId: record.channelId,
                    });
                }, randomDelay);

            });
        } catch (error) {
            console.error('Error cleaning up expired away records:', error);
        }
    });

    return GuildSettings;
}