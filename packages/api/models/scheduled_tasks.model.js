const { Model, DataTypes, Op } = require('sequelize');

class ScheduledTasks extends Model {
    static associate(models) {
        this.belongsTo(models.Guild, { foreignKey: 'guildId' })
        this.belongsTo(models.User, { foreignKey: 'userId' })
    }
}

module.exports = sequelize => {
    ScheduledTasks.init({
        taskId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ // Discord Snowflake
            }
        },
        guildId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ // Discord Snowflake
            }
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ // Discord Snowflake
            }
        },
        channelId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            validate: {
                is: /^\d{17,20}$/ // Discord Snowflake
            }
        },
        schedule: {
            type: DataTypes.STRING,
            allowNull: false
        },
        tool: {
            type: DataTypes.STRING,
            allowNull: false
        },
        toolInput: {
            type: DataTypes.JSON,
            allowNull: false
        },
        maxExecutions: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        executionCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('active', 'stopped'),
            defaultValue: 'active'
        }
    }, {
        sequelize,
        modelName: 'scheduled_tasks',
        timestamps: true,
        createdAt: true,
        updatedAt: true,
        paranoid: true,
        indexes: [
            {
                unique: true,
                fields: ['channelId', 'startDate'],
                where: {
                    [Op.or]: [
                        { channelId: { [Op.not]: null } },
                        { startDate: { [Op.not]: null } }
                    ]
                }
            }
        ]
    });

    ScheduledTasks.beforeDestroy(async (instance) => {
        instance.status = 'stopped';
    });

    return ScheduledTasks;
}