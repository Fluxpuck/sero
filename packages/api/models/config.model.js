const { Model, DataTypes } = require('sequelize');

class ConfigFlags extends Model {
    static associate(models) {

    }
}

module.exports = sequelize => {
    ConfigFlags.init({
        config: {
            type: DataTypes.STRING,
            primaryKey: true,
            unique: true,
            allowNull: false,
        },
        value: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    }, {
        sequelize,
        modelName: 'configflags',
        timestamps: true,
        createdAt: true
    });

    return ConfigFlags;
}