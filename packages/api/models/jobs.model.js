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
            min: {
                args: [0],
                msg: 'Minimum value constraint violated.', // Error message if constraint is violated
            },
            max: {
                args: [100_000],
                msg: 'Maximum value constraint violated.', // Error message if constraint is violated
            },
        },
        raise: {
            type: DataTypes.DECIMAL(3, 1),
            allowNull: false,
            min: {
                args: [0],
                msg: 'Minimum value constraint violated.', // Error message if constraint is violated
            },
            max: {
                args: [20],
                msg: 'Maximum value constraint violated.', // Error message if constraint is violated
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
