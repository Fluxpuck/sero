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
                msg: 'Minimum value constraint violated.', // Error message if constraint is violated
            },
            max: {
                args: [100],
                msg: 'Maximum value constraint violated.', // Error message if constraint is violated
            },
        },
        experience: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            min: {
                args: [0],
                msg: 'Minimum value constraint violated.', // Error message if constraint is violated
            },
            max: {
                args: [10_000_000],
                msg: 'Maximum value constraint violated.', // Error message if constraint is violated
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