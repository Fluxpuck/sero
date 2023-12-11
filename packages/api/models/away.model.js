const { Model, DataTypes } = require('sequelize');

class Away extends Model {
    static associate(models) {
        // this.belongsToMany(models.Guild, {
        //     foreignKey: 'userHash', // This should match the foreign key in the Moderator model
        //     otherKey: 'guildId', // Foreign key for the Guild model
        // });
        // this.belongsToMany(models.User, {
        //     foreignKey: 'userHash', // This should match the foreign key in the Moderator model
        //     otherKey: 'userId', // Foreign key for the Guild model
        // });
        // this.belongsTo(models.User, {
        //     foreignKey: 'userHash', // This should match the foreign key in the User model (userHash)
        //     targetKey: 'userHash', // This should match the target key in the User model (userHash)
        // });
    }
}

module.exports = sequelize => {
    Away.init({
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
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 5,
        },
        expireAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'away',
        timestamps: true,
        createdAt: true,
        hooks: {
            beforeCreate: (away, options) => {
                // Calculate expireAt based on duration and createdAt
                const expireAt = new Date(away.createdAt);
                expireAt.setMinutes(expireAt.getMinutes() + away.duration);
                away.expireAt = expireAt;
            },
        },
    });

    return Away;
}