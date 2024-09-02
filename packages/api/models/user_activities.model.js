const { Model, DataTypes } = require('sequelize');

class UserActivities extends Model {
    static associate(models) {
        this.belongsTo(models.User, { foreignKey: { name: 'userId', allowNull: false } });
        this.belongsTo(models.Guild, { foreignKey: { name: 'guildId', allowNull: false } });
    }
}

module.exports = sequelize => {
    UserActivities.init({
        guildId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        executedBy: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        commandName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        additional: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'user_activities',
        timestamps: true,
        createdAt: true,
        updatedAt: true,
    });

    return UserActivities;
}