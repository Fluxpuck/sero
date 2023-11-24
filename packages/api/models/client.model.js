const { Model, DataTypes } = require('sequelize');

class Client extends Model {
    static associate(models) {
        this.hasMany(models.Commands, { foreignKey: 'clientId' });
    }
}

module.exports = sequelize => {
    Client.init({
        clientId: {
            type: DataTypes.STRING,
            primaryKey: true,
            unique: true,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        clientName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        isPending: {
            type: DataTypes.BOOLEAN,
            allowNull: true
        },
        disconnectedAt: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'client',
        timestamps: true,
        createdAt: true,
    });

    return Client;
}