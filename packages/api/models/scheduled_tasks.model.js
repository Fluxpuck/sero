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
            unique: true,
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
        schedule: {
            type: DataTypes.STRING,
            allowNull: false
        },
        task: {
            type: DataTypes.TEXT,
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
    }, {
        sequelize,
        modelName: 'scheduled_tasks',
        timestamps: true,
        createdAt: true,
        updatedAt: true,
        paranoid: true
    });

    ScheduledTasks.beforeDestroy(async (instance) => {
        instance.status = 'stopped';
    });

    return ScheduledTasks;
}