const { Model, DataTypes } = require('sequelize');

class UserBalance extends Model {
    static associate(models) {
        this.belongsTo(models.User, { foreignKey: { name: 'userId', allowNull: false } });
        this.belongsTo(models.Guild, { foreignKey: { name: 'guildId', allowNull: false } });
    }
}

module.exports = sequelize => {
    UserBalance.init({
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
        balance: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            min: {
                args: [-100_000],
                msg: 'Minimum value constraint violated.', // Error message if constraint is violated
            },
            max: {
                args: [1_000_000_000],
                msg: 'Maximum value constraint violated.', // Error message if constraint is violated
            },
        },
    }, {
        sequelize,
        modelName: 'user_balance',
        timestamps: true,
        updatedAt: true,
        createdAt: true
    });

    return UserBalance;
}
