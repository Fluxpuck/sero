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
        // cronJob: {
        //     type: DataTypes.STRING,
        //     allowNull: true, // Should be false but it keeps whining >:(
        // },
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
            // Note doesn't trigger on beforeCreate, could this be a problem elsewhere as well? (cause: createOrUpdateRecord() in route)
            afterUpsert: async (record, options) => {
                // Not needed                
                // // Schedule the redis message and save it
                // const job = await scheduleBoost(record);
                // record.cronJob = job.options.name;
                // await record.save();
            },
            afterDestroy: (record, options) => {
                // Not needed
                // const cronJobName = record.cronJob;
                // try {
                //     const cronJob = cron.getTasks().get(cronJobName);
                //     cronJob.stop()
                //     cron.getTasks().delete(cronJobName);
                // } catch (error) {
                //     console.error(error);
                // }
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
        setTimeout(async () => { // Maybe the timeout is unnecessary :P
            endBoost(record);
        }, record.duration * 60 * 60 * 1000); // Convert duration from hours to milliseconds
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
            if (!record.repeat) { // If it's a one-time boost or we're nuking it
                await record.destroy();
            } else {
                record.isBoostActive = false;
                await record.save();
            }
        } else {
            await record.destroy(); // Lost record, just delete
        }
    }

    async function removedBoost(record) {
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

        // Backup delete any ended boosts
        const expiredBoosts = await ScheduledBoosts.findAll({
            where: {
                endAt: {
                    [Sequelize.Op.lt]: now,
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

    }

    // Schedule a single cron job to process all due boosts every minute
    cron.schedule('* * * * *', processBoosts);

    // Little story time:
    // So I was worried that checking every minute for due boosts would be too much for the server,
    // so I made a whole thing to schedule the boosts individually with their own cron jobs.
    // But after reconsidering, I realized that this would be just as if not more taxing on the server.
    // So now we're seeing what boosts need to be processed every minute.

    // async function scheduleBoost(record, existing = false) {
    //     const hour = record.time.split(':')[0];
    //     const minute = record.time.split(':')[1];
    //     const cronExpression = `${minute} ${hour} * * ${record.day}`;

    //     let job = cron.schedule(cronExpression, async () => {
    //         const guild = await sequelize.models.guild.findOne({ where: { guildId: record.guildId } });
    //         const setting = await sequelize.models.guild_settings.findOne({ where: { guildId: record.guildId, type: "scheduled-boost-messages" } });

    //         if (guild) {
    //             await withTransaction(async (t) => {
    //                 guild.modifier = record.modifier;
    //                 guild.duration = record.duration;
    //                 await guild.save({ transaction: t });
    //             })
    //             record.isBoostActive = true;
    //             await record.save();
    //             publishMessage(REDIS_CHANNELS.BOOST_SCHEDULE, {
    //                 guildId: record.guildId,
    //                 modifier: record.modifier,
    //                 duration: record.duration,
    //                 repeat: record.repeat,
    //                 eventId: record.eventId,
    //                 channelId: setting.targetId
    //             });
    //             if (!record.repeat) {
    //                 setTimeout(async () => {
    //                     await record.destroy();
    //                 }, record.duration * 60 * 1000); // Convert duration from minutes to milliseconds
    //             } else {
    //                 setTimeout(async () => {
    //                     record.isBoostActive = false;
    //                     await record.save();
    //                 }, record.duration * 60 * 1000); // Convert duration from minutes to milliseconds
    //             }
    //         }
    //     });

    //     // Update the cronJob field with job.options.name
    //     try {
    //         record.cronJob = job.options.name;
    //         if (existing) {
    //             await record.save();
    //             return null
    //         } else return job
    //     } catch (error) {
    //     }
    // }

    // // Since the cron jobs die when the API dies (or restarts) we need to reinit them all
    // async function initScheduledBoosts() {
    //     const records = await ScheduledBoosts.findAll();
    //     records.forEach(record => {
    //         scheduleBoost(record, existing=true);
    //     });
    // }
    // initScheduledBoosts()

    return ScheduledBoosts;
};