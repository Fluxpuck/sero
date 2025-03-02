const { Model, DataTypes } = require("sequelize");
const { DISCORD_SNOWFLAKE } = require('../config/config');

class UserBirthday extends Model {
    static associate(models) {
        this.belongsTo(models.User, {
            foreignKey: { name: "userId", allowNull: false },
        });
        this.belongsTo(models.Guild, {
            foreignKey: { name: "guildId", allowNull: false },
        });
    }
}

module.exports = (sequelize) => {
    UserBirthday.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: DISCORD_SNOWFLAKE,
            },
        },
        guildId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: DISCORD_SNOWFLAKE,
            },
        },
        year: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        month: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        day: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
    },
        {
            sequelize,
            modelName: "user_birthday",
            timestamps: true,
            updatedAt: true,
            createdAt: true,
            indexes: [
                {
                    fields: ["userId", "guildId"],
                    unique: true,
                },
            ],
        });

    return UserBirthday;
};
