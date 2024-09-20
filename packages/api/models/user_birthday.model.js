const { Model, DataTypes } = require("sequelize");

class UserBirthday extends Model {
    static associate(models) {
        this.belongsTo(models.User, { foreignKey: { name: "userId", allowNull: false } });
        this.belongsTo(models.Guild, { foreignKey: { name: "guildId", allowNull: false } });
    }
}

module.exports = sequelize => {
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
            birthdayDay: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    min: {
                        args: [1],
                        msg: "Birthday day cannot be less than 1.",
                    },
                    max: {
                        args: [31],
                        msg: "Birthday day cannot be greater than 31.",
                    },
                },
            },
            birthdayMonth: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    min: {
                        args: [1],
                        msg: "Birthday month cannot be less than 1.",
                    },
                    max: {
                        args: [12],
                        msg: "Birthday month cannot be greater than 12.",
                    },
                },
            },
            birthdayYear: {
                type: DataTypes.INTEGER,
                allowNull: true,
                validate: {
                    min: {
                        args: [1900],
                        msg: "Birthday year cannot be less than 1900.",
                    },
                    isValidYear(value) {
                        const currentYear = new Date().getFullYear();
                        if (value > currentYear) {
                            throw new Error(`Birthday year cannot be greater than ${currentYear}.`);
                        }
                    },
                },
            },
            modifiedAmount: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                validate: {
                    min: {
                        args: [0],
                        msg: "Modified amount cannot be less than 0.",
                    },
                    // No max needed, it can be modified any number of times, but not less than 0 and the command sets a max of 2 times
                },
            },
        },
        {
            sequelize,
            modelName: "user_birthday",
            timestamps: true,
            updatedAt: true,
            createdAt: true,
            hooks: {
                // Add + 1 to the modifiedAmount when the birthday has been modified
                //  (this also automatically detects if the birthday has been changed before classifying it as a modification)
                afterUpdate: (instance, options) => {
                    if (
                        instance.changed("birthdayDay") ||
                        instance.changed("birthdayMonth") ||
                        instance.changed("birthdayYear")
                    ) {
                        instance.modifiedAmount += 1;
                        instance.save();
                    }
                },
            },
        },
    );

    return UserBirthday;
};
