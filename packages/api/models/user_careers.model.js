const { Model, DataTypes } = require('sequelize');
const { DISCORD_SNOWFLAKE } = require('../config/config');

class UserCareers extends Model {
    static associate(models) {
        this.belongsTo(models.User, { foreignKey: { name: 'userId', allowNull: false } });
        this.belongsTo(models.Guild, { foreignKey: { name: 'guildId', allowNull: false } });
        this.belongsTo(models.Jobs, { foreignKey: 'jobId', allowNull: false });
    }
}

module.exports = sequelize => {
    UserCareers.init({
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
        createdAt: true,
        indexes: [
            {
                fields: ['userId', 'guildId', 'jobId'],
                unique: true,
            }
        ]
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
