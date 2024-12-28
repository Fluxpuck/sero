const { Model, DataTypes } = require('sequelize');

class UserWallet extends Model {
    static MINIMUM_BALANCE = 0;
    static MAXIMUM_BALANCE = 10_000;

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
                    args: [UserWallet.MINIMUM_BALANCE],
                    msg: `Wallet balance cannot be less than ${UserWallet.MINIMUM_BALANCE}`,
                },
                max: {
                    args: [UserWallet.MAXIMUM_BALANCE],
                    msg: `Wallet balance cannot be greater than ${UserWallet.MAXIMUM_BALANCE}`,
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
