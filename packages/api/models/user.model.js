const { Model, DataTypes } = require('sequelize');

class User extends Model {
    static associate(models) {
        this.belongsTo(models.Guild, { foreignKey: 'guildId' })
        this.hasMany(models.UserLevels, { foreignKey: 'userId' })
        this.hasMany(models.UserBalance, { foreignKey: 'userId' })
        this.hasMany(models.UserCareers, { foreignKey: 'userId' })
        this.hasMany(models.Logs, { foreignKey: 'userId' })
        this.hasMany(models.Messages, { foreignKey: 'userId' })
        this.hasMany(models.Away, { foreignKey: 'userId' })
        this.hasMany(models.Work_snapshot, { foreignKey: 'userId' })
    }
}

module.exports = sequelize => {
    User.init({
        userId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        userName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        guildId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        moderator: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    }, {
        sequelize,
        modelName: 'user',
        timestamps: true,
        createdAt: true,
        updatedAt: true,
    });

    return User;
}