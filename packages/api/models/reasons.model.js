const { Model, DataTypes } = require('sequelize');

class Reasons extends Model {
    static associate(models) {
        // this.belongsTo(models.Guild, { foreignKey: 'guildId' });
    }
}

module.exports = sequelize => {
    Reasons.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        guildId: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/
            },
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [['ban', 'kick', 'warn']]
            }
        },
    }, {
        sequelize,
        modelName: 'reasons',
        timestamps: true,
        createdAt: true
    });

    return Reasons;
};