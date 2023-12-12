const { Model, DataTypes } = require('sequelize');

class Messages extends Model {
    static associate(models) {
        // this.belongsTo(models.User, { foreignKey: 'userHash' });
        // this.belongsTo(models.Guild, { foreignKey: 'guildId' });
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
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        channelId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
        guildId: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
    }, {
        sequelize,
        modelName: 'messages',
        timestamps: true,
        createdAt: true
    });

    return Messages;
}