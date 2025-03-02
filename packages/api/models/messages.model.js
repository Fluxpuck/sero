const { Model, DataTypes } = require('sequelize');
const { DISCORD_SNOWFLAKE } = require('../config/config');

class Messages extends Model {
    static associate(models) {
        this.belongsTo(models.Guild, { foreignKey: 'guildId' })
        this.belongsTo(models.User, { foreignKey: 'userId' })
    }
}

module.exports = sequelize => {
    Messages.init({
        messageId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            allowNull: false,
            unique: true,
            validate: {
                is: DISCORD_SNOWFLAKE
            }
        },
        channelId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: DISCORD_SNOWFLAKE
            }
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: DISCORD_SNOWFLAKE
            }
        },
        guildId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: DISCORD_SNOWFLAKE
            }
        },
    }, {
        sequelize,
        modelName: 'messages',
        timestamps: true,
        createdAt: true
    });


    // @TODO: ADD A HOOK TO REMOVE MESSAGES OLDER THAN 3 to 12 MONTHS

    return Messages;
}