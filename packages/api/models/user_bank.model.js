const { Model, DataTypes } = require('sequelize');

class UserBank extends Model {
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
                    args: [-0],
                    msg: 'Balance cannot be less than -100,000.',
                },
                max: {
                    args: [1_000_000_000],
                    msg: 'Balance cannot be greater than 1,000,000,000.',
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
