const { Model, DataTypes } = require('sequelize');

class GuildSettings extends Model {
    static associate(models) {
        this.belongsTo(models.Guild, { foreignKey: 'guildId' })
    }
}

module.exports = sequelize => {
    GuildSettings.init({
        guildId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        type: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
        },
        channelId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
    }, {
        sequelize,
        modelName: 'guild_settings',
        timestamps: true,
        createdAt: true,
        updatedAt: true,
    });

    return GuildSettings;
}