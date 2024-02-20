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
            min: 0,
            max: 200_000
        },
        raise: {
            type: DataTypes.DECIMAL(3, 1),
            allowNull: false,
            min: 0,
            max: 10
        },
    }, {
        sequelize,
        modelName: 'jobs',
        timestamps: true,
        createdAt: true
    });

    return Jobs;
}
