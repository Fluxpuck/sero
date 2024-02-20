const { Model, DataTypes } = require('sequelize');

class UserCareers extends Model {
    static associate(models) {
        this.belongsTo(models.User, { foreignKey: { name: 'userId', allowNull: false } });
        this.belongsTo(models.Guild, { foreignKey: { name: 'guildId', allowNull: false } });
        this.belongsTo(models.Jobs, { foreignKey: 'jobId', allowNull: false });
    }
}

module.exports = sequelize => {
    UserCareers.init({
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
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        jobId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        level: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            min: 0,
            max: 100
        },
    }, {
        sequelize,
        modelName: 'user_careers',
        timestamps: true,
        updatedAt: true,
        createdAt: true
    });

    return UserCareers;
}
