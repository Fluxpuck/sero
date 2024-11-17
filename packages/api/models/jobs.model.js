const { Model, DataTypes } = require('sequelize');

class Jobs extends Model {
    static associate(models) {
        this.hasMany(models.UserCareers, { foreignKey: 'jobId' });
    }
}

module.exports = sequelize => {
    Jobs.init({
        jobId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        emoji: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        salary: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: {
                    args: [0],
                    msg: 'Salary cannot be negative',
                },
                max: {
                    args: [100_000],
                    msg: 'Salary cannot be greater than 100,000',
                },
            }
        },
        payRaise: {
            type: DataTypes.FLOAT,
            allowNull: false,
            min: {
                args: [0],
                msg: 'Pay raise cannot be a negative procentage',
            },
            max: {
                args: [20],
                msg: 'Pay raise be greater than 20 procent',
            },
        },
    }, {
        sequelize,
        modelName: 'jobs',
        timestamps: true,
        createdAt: true
    });

    return Jobs;
}
