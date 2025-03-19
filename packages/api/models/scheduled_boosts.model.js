const { Sequelize, Model, DataTypes } = require('sequelize');
const { publishMessage, REDIS_CHANNELS } = require('../database/publisher');
const cron = require('node-cron');
const { withTransaction } = require('../utils/RequestManager');

class ScheduledBoosts extends Model { // TODO: make use of the associations
    static associate(models) {
        this.belongsTo(models.Guild, { foreignKey: 'guildId' })
    }
}

module.exports = sequelize => {
    ScheduledBoosts.init({
        guildId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ // Discord Snowflake
            }
        },
        modifier: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: {
                    args: [0],
                    msg: 'Modifier cannot be 0'
                },
                max: {
                    args: [5],
                    msg: 'Modifier cannot be greater than 5'
                },
            },
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 1,
                max: 120,
            },
        },
        day: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0,
                max: 6,
            },
        },
        time: {
            type: DataTypes.STRING, // 24 hour using bot is UTC (e.g. 03:54)
            allowNull: false,
            validate: {
                is: /^[0-2][0-9]:[0-5][0-9]$/,
            },
        },
        repeat: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        eventId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            validate: {
                is: /^\d{17,20}$/ // Discord Snowflake
            }
        },
        isBoostActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        endAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'scheduled_boosts',
        timestamps: true,
        createdAt: true,
        updatedAt: false,
        hooks: {
            beforeValidate: (record, options) => {
                if (record.time.length < 5) {
                    record.time = `0${record.time}`;
                }
            },
            afterDestroy: (record, options) => {
                removedBoost(record);
            },
        },
    });

    async function startBoost(record) {
        const guild = await sequelize.models.guild.findOne({ where: { guildId: record.guildId } });
        const setting = await sequelize.models.guild_settings.findOne({ where: { guildId: record.guildId, type: "scheduled-boost-messages" } });
        await withTransaction(async (t) => {
            guild.modifier = record.modifier;
            guild.duration = record.duration;
            await guild.save({ transaction: t });
        });
        record.isBoostActive = true;
        record.endAt = new Date(Date.now() + record.duration * 60 * 60 * 1000); // Convert duration from minutes to milliseconds
        await record.save();
        publishMessage(REDIS_CHANNELS.BOOST_SCHEDULE, {
            boostId: record.boostId,
            guildId: record.guildId,
            modifier: record.modifier,
            duration: record.duration,
            repeat: record.repeat,
            eventId: record.eventId,
            channelId: setting ? setting.targetId : null,
            status: "start"
        });
    }

    async function endBoost(record) {
        const guild = await sequelize.models.guild.findOne({ where: { guildId: record.guildId } });
        const setting = await sequelize.models.guild_settings.findOne({ where: { guildId: record.guildId, type: "scheduled-boost-messages" } });
        if (guild) {
            publishMessage(REDIS_CHANNELS.BOOST_SCHEDULE, {
                boostId: record.boostId,
                guildId: record.guildId,
                repeat: record.repeat,
                eventId: record.eventId,
                channelId: setting ? setting.targetId : null,
                status: "end"
            });
            record.isBoostActive = false;
            record.endAt = null;
            await record.save();
            if (!record.repeat) { // If it's a one-time boost
                await record.destroy();
            }
        } else {
            await record.destroy(); // Lost record, just delete
        }
    }

    async function removedBoost(record) {
        const guild = await sequelize.models.guild.findOne({ where: { guildId: record.guildId } });
        const setting = await sequelize.models.guild_settings.findOne({ where: { guildId: record.guildId, type: "scheduled-boost-messages" } });
        if (guild && record.isBoostActive) {
            publishMessage(REDIS_CHANNELS.BOOST_SCHEDULE, {
                boostId: record.boostId,
                guildId: record.guildId,
                repeat: record.repeat,
                eventId: record.eventId,
                channelId: setting ? setting.targetId : null,
                status: "end"
            });
            await withTransaction(async (t) => {
                guild.modifier = 1;
                guild.duration = null;
                await guild.save({ transaction: t });
            });
        }
        // Else lost record nothing to do
    }

    async function processBoosts() {
        const now = new Date();
        const currentDay = now.getDay();
        const currentTime = now.toTimeString().slice(0, 5); // Format as HH:MM

        // Process any ended boosts
        const expiredBoosts = await ScheduledBoosts.findAll({
            where: {
                endAt: {
                    [Sequelize.Op.lte]: new Date(),
                },
                isBoostActive: true,
            },
        });
        try {
            for (const record of expiredBoosts) {
                endBoost(record);
            }
        } catch (error) {
            console.error(error);
        }

        // Process any to be started events (this one after ending on purpose)
        const dueBoosts = await ScheduledBoosts.findAll({
            where: {
                day: currentDay,
                time: currentTime,
                isBoostActive: false,
            },
        });

        try {
            for (const record of dueBoosts) {
                startBoost(record);
            }
        } catch (error) {
            console.error(error);
        }
    }

    // Schedule a single cron job to process all due boosts every minute
    cron.schedule('* * * * *', processBoosts);

    return ScheduledBoosts;
};