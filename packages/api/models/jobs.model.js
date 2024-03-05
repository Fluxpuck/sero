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
            min: 0,
            max: 100_000
        },
        raise: {
            type: DataTypes.DECIMAL(3, 1),
            allowNull: false,
            min: 0,
            max: 20
        },
    }, {
        sequelize,
        modelName: 'jobs',
        timestamps: true,
        createdAt: true
    });

    return Jobs;
}
