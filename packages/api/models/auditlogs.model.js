const { Model, DataTypes } = require('sequelize');

class AuditLogs extends Model {
    static associate(models) {
        // this.belongsTo(models.Guild, { foreignKey: 'guildId' });
        // this.belongsTo(models.User, { foreignKey: 'userHash' });
    }
}

module.exports = sequelize => {
    AuditLogs.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        targetId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        executorId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'auditlogs',
        timestamps: true,
        createdAt: true
    });

    return AuditLogs;
}