const { Model, DataTypes } = require('sequelize');
const { DISCORD_SNOWFLAKE } = require('../config/config');

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
                    args: [UserBank.MINIMUM_BALANCE],
                    msg: `Bank balance cannot be less than ${UserBank.MINIMUM_BALANCE}`,
                },
                max: {
                    args: [UserBank.MAXIMUM_BALANCE],
                    msg: `Bank balance cannot be greater than ${UserBank.MAXIMUM_BALANCE}`,
                }
            }
        },
    }, {
        sequelize,
        modelName: 'user_bank',
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

    return UserBank;
}
