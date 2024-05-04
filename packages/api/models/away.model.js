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

    // Clean up expired records every second
    cron.schedule('* * * * * *', async () => {
        try {
            await Away.destroy({
                where: {
                    expireAt: {
                        // Select records where expireAt is in the past
                        [Sequelize.Op.lt]: new Date(),
                    },
                },
            });
        } catch (error) {
            console.error('Error cleaning up expired records:', error);
        }
    });

    return Away;
}