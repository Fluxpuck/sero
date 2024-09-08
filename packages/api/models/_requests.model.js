const { Model, DataTypes } = require('sequelize');

class _Requests extends Model {
    static associate(models) {
    }
}

module.exports = sequelize => {
    _Requests.init({
        method: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        responseTime: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        body: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: '_requests',
        timestamps: true,
        createdAt: true
    });

    return _Requests;
}
