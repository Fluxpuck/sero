const { Model, DataTypes } = require('sequelize');

class Logs extends Model {
    static associate(models) {
        this.belongsTo(models.Guild, { foreignKey: 'guildId' })
        this.belongsTo(models.User, { foreignKey: 'targetId' })
        this.belongsTo(models.User, { foreignKey: 'executorId' })
    }
}

module.exports = sequelize => {
    Logs.init({
        id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            primaryKey: true,
            unique: true,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        guildId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        auditAction: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        auditType: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        targetId: {
            type: DataTypes.BIGINT,
            allowNull: true,
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
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        }
    }, {
        sequelize,
        modelName: 'logs',
        timestamps: true,
        createdAt: true,
        updatedAt: true,
        paranoid: true,
        hooks: {
            // Set the reason to "No reason provided" if no reason is provided
            beforeSave: (log, options) => {
                if (!log.reason || log.reason === null) {
                    log.reason = "No reason provided";
                }
            }
        }
    });

    return Logs;
}