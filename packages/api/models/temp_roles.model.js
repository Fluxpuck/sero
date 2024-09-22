const { Sequelize, Model, DataTypes } = require('sequelize');
const { publishMessage, REDIS_CHANNELS } = require('../database/publisher');
const cron = require('node-cron');

class TempRoles extends Model {
    static associate(models) {
        this.belongsTo(models.Guild, { foreignKey: 'guildId' })
        this.belongsTo(models.User, { foreignKey: 'userId' })
    }
}

module.exports = sequelize => {
    TempRoles.init({
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        guildId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        roleId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 5,
            validate: {
                min: {
                    args: [1],
                    msg: 'Duration must be at least 1 hour.',
                },
                max: {
                    args: [168],
                    msg: 'Duration cannot be more than 7 day.',
                },
            },
        },
        expireAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'temp_roles',
        timestamps: true,
        createdAt: true,
        hooks: {
            beforeCreate: (record, options) => {
                // Calculate expireAt based on duration and createdAt
                const expireAt = new Date(record.createdAt);
                expireAt.setHours(expireAt.getHours() + record.duration);
                record.expireAt = expireAt;
            },
        }
    });

    // Clean up expired records every minute
    cron.schedule('* * * * * ', async () => {

        try {
            // Fetch records that are about to be deleted
            const expiredRoles = await TempRoles.findAll({
                where: {
                    expireAt: {
                        [Sequelize.Op.lt]: new Date(),
                    },
                },
            });

            // Publish a message to Redis for each expired role
            for (const role of expiredRoles) {
                // Publish the user's new rank to the Redis channel
                publishMessage(REDIS_CHANNELS.ROLE,
                    {
                        guildId: role.guildId,
                        userId: role.userId,
                        roleId: role.roleId,
                    }
                );
            }

        } catch (error) {
            console.error('Error finding expired temp_roles records and publishing Redis message:', error);
        }
    });

    return TempRoles;
}