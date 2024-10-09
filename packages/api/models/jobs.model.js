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
        wage: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: {
                    args: [0],
                    msg: 'Wage cannot be negative.',
                },
                max: {
                    args: [100_000],
                    msg: 'Wage cannot be greater than 100,000.',
                },
            }
        },
        raise: {
            type: DataTypes.FLOAT,
            allowNull: false,
            min: {
                args: [0],
                msg: 'Raise cannot be negative.',
            },
            max: {
                args: [20],
                msg: 'Raise cannot be greater than 20.',
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
