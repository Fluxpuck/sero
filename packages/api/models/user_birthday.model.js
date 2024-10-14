const { Model, DataTypes } = require("sequelize");

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
    UserBirthday.init(
        {
            userId: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                allowNull: false,
                validate: {
                    is: /^\d{17,20}$/, //Discord Snowflake
                },
            },
            guildId: {
                type: DataTypes.BIGINT,
                primaryKey: true,
                allowNull: false,
                validate: {
                    is: /^\d{17,20}$/, //Discord Snowflake
                },
            },
            birthdayAt: {
                type: DataTypes.DATE,
                allowNull: false,
            },
        },
        {
            sequelize,
            modelName: "user_birthday",
            timestamps: true,
            updatedAt: true,
            createdAt: true,
        }
    );

    return UserBirthday;
};
