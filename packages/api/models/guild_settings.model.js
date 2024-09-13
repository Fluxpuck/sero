const { Model, DataTypes } = require('sequelize');
const { publishMessage, REDIS_CHANNELS } = require('../database/publisher');
const cron = require('node-cron');
const { generateUniqueToken } = require('../utils/FunctionManager');

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

    // Execute a reward drop every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
        try {
            // Find all records with type === 'exp-reward-drops'
            const dropGuilds = await GuildSettings.findAll({
                where: {
                    type: 'exp-reward-drops'
                }
            });

            // Iterate over the results and run publishMessage for each record
            dropGuilds.forEach(record => {

                const MIN_HOUR = 2 * 60 * 1000; // 2 minutes in milliseconds
                const MAX_HOUR = 30 * 60 * 1000; // 30 minutes in milliseconds

                // Calculate a random delay between MIN_HOUR and MAX_HOUR
                const randomDelay = Math.floor(Math.random() * (MAX_HOUR - MIN_HOUR)) + MIN_HOUR;

                // Execute the job
                setTimeout(() => {
                    publishMessage(REDIS_CHANNELS.DROP, {
                        guildId: record.guildId,
                        channelId: record.channelId,
                        token: generateUniqueToken()
                    });
                }, randomDelay);

            });
        } catch (error) {
            console.error('Error cleaning up expired away records:', error);
        }
    });

    return GuildSettings;
}