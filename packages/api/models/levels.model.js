const { Model, DataTypes } = require('sequelize');

class Levels extends Model {
    static associate(models) {
    }
}

module.exports = sequelize => {
    Levels.init({
        level: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            min: {
                args: [0],
                msg: 'Level cannot be null.',
            },
            max: {
                args: [100],
                msg: 'Level cannot be greater than 100.',
            },
        },
        experience: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            min: {
                args: [0],
                msg: 'Experience cannot be negative.',
            },
            max: {
                args: [10_000_000],
                msg: 'Experience cannot be greater than 10,000,000.',
            },
        },
    }, {
        sequelize,
        modelName: 'levels',
        updatedAt: false,
        createdAt: false
    });

    return Levels;
}