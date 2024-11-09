const { Model, DataTypes } = require('sequelize');

class UserWallet extends Model {
    static associate(models) {
        this.belongsTo(models.User, { foreignKey: { name: 'userId', allowNull: false } });
        this.belongsTo(models.Guild, { foreignKey: { name: 'guildId', allowNull: false } });
    }
}

module.exports = sequelize => {
    UserWallet.init({
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
                    args: [0],
                    msg: 'Wallet balance cannot be less than empty',
                },
                max: {
                    args: [10_000],
                    msg: 'Wallet can not hold more than 10,000',
                }
            }
        },
    }, {
        sequelize,
        modelName: 'user_wallet',
        timestamps: true,
        updatedAt: true,
        createdAt: true
    });

    return UserWallet;
}
