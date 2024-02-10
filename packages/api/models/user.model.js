const { Model, DataTypes } = require('sequelize');

class User extends Model {
    static associate(models) {
        this.belongsTo(models.Guild, { foreignKey: 'guildId' })
        this.hasMany(models.Levels, { foreignKey: 'userId' })
        this.hasMany(models.Logs, { foreignKey: 'userId' })
        this.hasMany(models.Messages, { foreignKey: 'userId' })
        this.hasMany(models.Away, { foreignKey: 'userId' })
    }
}

module.exports = sequelize => {
    User.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
        },
        userName: {
            type: DataTypes.STRING,
            allowNull: false
        },
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