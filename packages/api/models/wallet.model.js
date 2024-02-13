const { Model, DataTypes } = require('sequelize');

class Wallet extends Model {
    static associate(models) {
        this.belongsTo(models.User, { foreignKey: { name: 'userId', allowNull: false } });
        this.belongsTo(models.Guild, { foreignKey: { name: 'guildId', allowNull: false } });
    }
}

module.exports = sequelize => {
    Wallet.init({
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
        debit: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            min: -100_000,
            max: 1_000_000_000
        },
        stocks: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: {}
        }
    }, {
        sequelize,
        modelName: 'wallet',
        timestamps: true,
        updatedAt: true,
        createdAt: true
    });

    return Wallet;
}
