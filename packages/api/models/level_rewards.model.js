const { Model, DataTypes } = require('sequelize');

class LevelRewards extends Model {
    static associate(models) {
        this.hasMany(models.Levels, { foreignKey: 'level' })
        this.belongsTo(models.Guild, { foreignKey: 'guildId' })
    }
}

module.exports = sequelize => {
    LevelRewards.init({
        rankId: {
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
        level: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        roleId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            validate: {
                is: /^\d{17,20}$/ // Discord Snowflake
            }
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

