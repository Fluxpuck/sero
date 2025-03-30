const { Model, DataTypes } = require('sequelize');

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
            type: DataTypes.BIGINT,
            allowNull: false,
            validate: {
                is: /^\d{17,20}$/ //Discord Snowflake
            }
        },
    }, {
        sequelize,
        modelName: 'messages',
        timestamps: true,
        createdAt: true,
        paranoid: true,
    });


    // @TODO: ADD A HOOK TO REMOVE MESSAGES OLDER THAN 3 to 12 MONTHS

    return Messages;
}