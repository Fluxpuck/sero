const { Sequelize, Model, DataTypes } = require('sequelize');
const cron = require('node-cron');

class Away extends Model {
    static associate(models) {
        this.belongsTo(models.User, { foreignKey: 'userId' })
        this.belongsTo(models.Guild, { foreignKey: 'guildId' })
    }
}

module.exports = sequelize => {
    Away.init({
        userId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        guildId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ // Discord Snowflake
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
        hooks: {
            beforeCreate: (record, options) => {
                // Calculate expireAt based on duration and createdAt
                const expireAt = new Date(record.createdAt);
                expireAt.setMinutes(expireAt.getMinutes() + record.duration);
                record.expireAt = expireAt;
            },
            beforeUpdate: (record, options) => {
                // Calculate expireAt based on duration and createdAt
                const expireAt = new Date(record.updatedAt);
                expireAt.setMinutes(expireAt.getMinutes() + record.duration);
                record.expireAt = expireAt;
            },
            beforeFind: (options) => {
                // Only select records where expireAt is in the future
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
    cron.schedule('* * * * *', async () => {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000)); // 5 seconds timeout
        try {
            const result = await Promise.race([
                Away.destroy({
                    where: {
                        expireAt: {
                            // Select records where expireAt is in the past
                            [Sequelize.Op.lt]: new Date(),
                        },
                    },
                }),
                timeout
            ]);

            if (result > 0 && process.env.NODE_ENV === "development") {
                console.log(`Cleared ${result} expired away records`);
            }

        } catch (error) {
            console.error('Error cleaning up expired away records:', error);
        }
    });

    return Away;
}