const { Sequelize, Model, DataTypes } = require('sequelize');
const cron = require('node-cron');

class Away extends Model {
    static associate(models) {
    }
}

module.exports = sequelize => {
    Away.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        guildId: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 5,
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
            beforeCreate: (away, options) => {
                // Calculate expireAt based on duration and createdAt
                const expireAt = new Date(away.createdAt);
                expireAt.setMinutes(expireAt.getMinutes() + away.duration);
                away.expireAt = expireAt;
            },
            beforeUpdate: (away, options) => {
                // Calculate expireAt based on duration and createdAt
                const expireAt = new Date(away.updatedAt);
                expireAt.setMinutes(expireAt.getMinutes() + away.duration);
                away.expireAt = expireAt;
            },
        },
    });

    // Add a hook to automatically remove records that have passed their expireAt time
    Away.addHook('beforeFind', (options) => {
        options.where = {
            ...(options.where || {}),
            expireAt: {
                [Sequelize.Op.gt]: new Date(), // Only select records where expireAt is in the future
            },
        };
    });

    // Clean up expired records every hour
    cron.schedule('0 * * * *', async () => {
        try {
            await Away.destroy({
                where: {
                    expireAt: {
                        [Sequelize.Op.lt]: new Date(), // Select records where expireAt is in the past
                    },
                },
            });
        } catch (error) {
            console.error('Error cleaning up expired records:', error);
        }
    });

    return Away;
}