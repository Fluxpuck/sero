const { Model, DataTypes } = require('sequelize');
const { DISCORD_SNOWFLAKE } = require('../config/config');

class LevelRanks extends Model {
    static associate(models) {
        this.hasMany(models.Levels, { foreignKey: 'level' })
        this.belongsTo(models.Guild, { foreignKey: 'guildId' })
    }
}

module.exports = sequelize => {
    LevelRanks.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        guildId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: DISCORD_SNOWFLAKE // Discord Snowflake
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
                is: DISCORD_SNOWFLAKE // Discord Snowflake
            }
        },
    }, {
        sequelize,
        modelName: 'level_ranks',
        timestamps: true,
        updatedAt: true,
        createdAt: true,
        indexes: [
            {
                fields: ['guildId', 'level'],
                unique: true,
            }
        ]
    });

    return LevelRanks;
}

