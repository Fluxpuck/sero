const { Model, DataTypes } = require('sequelize');
const { DISCORD_SNOWFLAKE } = require('../config/config');

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
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: DISCORD_SNOWFLAKE
            }
        },
        guildId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: DISCORD_SNOWFLAKE
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
        createdAt: true,
        indexes: [
            {
                fields: ['userId', 'guildId'],
                unique: true,
            }
        ]
    });

    return UserWallet;
}
