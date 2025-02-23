const { Model, DataTypes } = require('sequelize');

class UserCareers extends Model {
    static associate(models) {
        this.belongsTo(models.User, { foreignKey: { name: 'userId', allowNull: false } });
        this.belongsTo(models.Guild, { foreignKey: { name: 'guildId', allowNull: false } });
        this.belongsTo(models.Jobs, { foreignKey: 'jobId', allowNull: false });
    }
}

module.exports = sequelize => {
    UserCareers.init({
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
        jobId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        experience: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            min: {
                args: [0],
                msg: 'Experience cannot be less than 0.',
            },
            max: {
                args: [1_000_000],
                msg: 'Experience cannot be greater than 1,000,000.',
            },
        },
        level: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            min: {
                args: [1],
                msg: 'Career level cannot be less than 1.',
            },
            max: {
                args: [1_000],
                msg: 'Career level cannot be greater than 1,000.',
            },
        },
    }, {
        sequelize,
        modelName: 'user_careers',
        timestamps: true,
        updatedAt: true,
        createdAt: true
    });


    UserCareers.beforeSave(async (userCareer, options) => {
        if (userCareer.changed('experience')) {

            let currentLevel = userCareer.level;
            let currentXP = userCareer.experience;

            while (true) {
                const requiredXP = 1000 + (currentLevel * 100);
                if (currentXP >= requiredXP) {
                    currentLevel++;
                    currentXP -= requiredXP;
                } else {
                    break;
                }
            }

            userCareer.level = currentLevel;
            userCareer.experience = currentXP;
        }
    });

    return UserCareers;
}
