const { Model, DataTypes } = require('sequelize');

class Moderator extends Model {
    static associate(models) {
        // this.belongsToMany(models.Guild, {
        //     foreignKey: 'userKey', // This should match the foreign key in the Moderator model
        //     otherKey: 'guildId', // Foreign key for the Guild model
        // });
        // this.belongsToMany(models.User, {
        //     foreignKey: 'userKey', // This should match the foreign key in the Moderator model
        //     otherKey: 'userId', // Foreign key for the Guild model
        // });
        // this.belongsTo(models.User, {
        //     foreignKey: 'userKey', // This should match the foreign key in the User model (userKey)
        //     targetKey: 'userKey', // This should match the target key in the User model (userKey)
        // });
    }
}

module.exports = sequelize => {
    Moderator.init({
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            unique: true,
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
        location: {
            type: DataTypes.STRING,
            allowNull: true
        },
        language: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'English'
        }
    }, {
        sequelize,
        modelName: 'moderator',
        timestamps: true,
        updatedAt: true,
        createdAt: true
    });

    return Moderator;
}