const { Sequelize, Model, DataTypes } = require('sequelize');
const cron = require('node-cron');
const { DISCORD_SNOWFLAKE } = require('../config/config');

class Away extends Model {
    static associate(models) {
        this.belongsTo(models.User, { foreignKey: 'userId' })
        this.belongsTo(models.Guild, { foreignKey: 'guildId' })
    }
}

module.exports = sequelize => {
    Away.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: DISCORD_SNOWFLAKE
            }
        },
        guildId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: DISCORD_SNOWFLAKE // Discord Snowflake
            }
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 5,
            validate: {
                min: {
                    args: [1],
                    msg: 'Duration must be at least 1 minute.',
                },
                max: {
                    args: [1440],
                    msg: 'Duration cannot be more than 1 day.',
                },
            },
        },
        message: {
            type: DataTypes.STRING,
            allowNull: true,
            maxLength: 250,
        },
        expireAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'away',
        timestamps: true,
        createdAt: true,
        updatedAt: true,
        indexes: [
            {
                fields: ['userId', 'guildId'],
                unique: true,
            }
        ],
        hooks: {
            beforeCreate: (record, options) => {
                const expiredAt = new Date(record.createdAt);
                expiredAt.setMinutes(expiredAt.getMinutes() + record.duration);
                record.expireAt = expiredAt;
            },

            beforeUpdate: (record, options) => {
                const expireAt = new Date(record.updatedAt);
                expireAt.setMinutes(expireAt.getMinutes() + record.duration);
                record.expireAt = expireAt;
            },

            beforeFind: (options) => {
                options.where = {
                    ...(options.where || {}),
                    expireAt: {
                        [Sequelize.Op.gt]: new Date(),
                    },
                };
            }

        },
    });

    // Clean up expired records every minute
    // Remove any records where expireAt is less than the current date
    cron.schedule('* * * * *', async () => {
        try {
            await Away.destroy({
                where: {
                    expireAt: {
                        [Sequelize.Op.lt]: new Date()
                    }
                },
                timeout: 5_000
            });
        } catch (error) {
            console.error('Error cleaning up expired away records:', error);
        }
    });

    return Away;
}


// TODO: Test the new changes & apply to all other models
