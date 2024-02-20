const { Model, DataTypes } = require('sequelize');

class LevelRewards extends Model {
    static associate(models) {
        this.hasMany(models.Levels, { foreignKey: 'level' })
        this.belongsTo(models.Guild, { foreignKey: 'guildId' })
    }
}

module.exports = sequelize => {
    LevelRewards.init({
        level: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
        },
        guildId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ // Discord Snowflake
            }
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
        modelName: 'level_rewards',
        timestamps: true,
        updatedAt: true,
        createdAt: true
    });

    return LevelRewards;
}

