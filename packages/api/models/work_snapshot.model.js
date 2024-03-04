const { Model, DataTypes } = require('sequelize');

class Work_snapshot extends Model {
    static associate(models) {
        this.belongsTo(models.User, { foreignKey: { name: 'userId', allowNull: false } });
        this.belongsTo(models.Guild, { foreignKey: { name: 'guildId', allowNull: false } });
        this.belongsTo(models.Jobs, { foreignKey: 'jobId', allowNull: false });
    }
}

module.exports = sequelize => {
    Work_snapshot.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
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
        jobId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        income: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    }, {
        sequelize,
        modelName: 'work_snapshot',
        timestamps: true,
        createdAt: true
    });

    return Work_snapshot;
}
