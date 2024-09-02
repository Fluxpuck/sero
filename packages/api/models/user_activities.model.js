const { Model, DataTypes } = require('sequelize');

class UserActivities extends Model {
    static associate(models) {
        this.belongsTo(models.Guild, { foreignKey: 'guildId' })
        this.belongsTo(models.User, { foreignKey: 'userId' })
    }
}

module.exports = sequelize => {
    UserActivities.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        guildId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        type: {
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
    });

    return UserActivities;
}