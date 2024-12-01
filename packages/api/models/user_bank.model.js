const { Model, DataTypes } = require('sequelize');

class UserBank extends Model {
    static MINIMUM_BALANCE = -100_000;
    static MAXIMUM_BALANCE = 1_000_000_000;

    static associate(models) {
        this.belongsTo(models.User, { foreignKey: { name: 'userId', allowNull: false } });
        this.belongsTo(models.Guild, { foreignKey: { name: 'guildId', allowNull: false } });
    }
}

module.exports = sequelize => {
    UserBank.init({
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
            validate: {
                min: {
                    args: [UserBank.MINIMUM_BALANCE],
                    msg: `Balance cannot be less than ${UserBank.MINIMUM_BALANCE}`,
                },
                max: {
                    args: [UserBank.MAXIMUM_BALANCE],
                    msg: `Balance cannot be greater than ${UserBank.MAXIMUM_BALANCE}`,
                }
            }
        },
    }, {
        sequelize,
        modelName: 'user_bank',
        timestamps: true,
        updatedAt: true,
        createdAt: true
    });

    return UserBank;
}
