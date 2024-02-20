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
            max: 100,
        },
        experience: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            min: 0,
            max: 10_000_000
        },
    }, {
        sequelize,
        modelName: 'levels',
    });

    return Levels;
}

