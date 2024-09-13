const { Model, DataTypes, Sequelize } = require("sequelize");
const cron = require('node-cron');

class Guild extends Model {
  static associate(models) {
    this.hasMany(models.User, { foreignKey: 'guildId' })
    this.hasMany(models.UserLevels, { foreignKey: 'guildId' })
    this.hasMany(models.UserBalance, { foreignKey: 'guildId' })
    this.hasMany(models.UserCareers, { foreignKey: 'guildId' })
    this.hasMany(models.Logs, { foreignKey: 'guildId' })
    this.hasMany(models.Messages, { foreignKey: 'guildId' })
    this.hasMany(models.GuildSettings, { foreignKey: 'guildId' })
    this.hasMany(models.Away, { foreignKey: 'guildId' })
    this.hasMany(models.Work_snapshot, { foreignKey: 'guildId' })
    this.hasMany(models.LevelRanks, { foreignKey: 'guildId' })
  }
}

module.exports = sequelize => {
  Guild.init({
    guildId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
      unique: true,
      validate: {
        is: /^\d{17,20}$/ // Discord Snowflake
      }
    },
    guildName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    modifier: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: {
          args: [0],
          msg: 'Modifyer cannot be 0'
        },
        max: {
          args: [5],
          msg: 'Modifyer cannot be greater than 5'
        },
      },
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 168,
      },
    },
    expireAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
    {
      sequelize,
      modelName: 'guild',
      timestamps: true,
      createdAt: true,
      updatedAt: true,
      hooks: {
        beforeUpdate: (guild, options) => {
          // Calculate expireAt based on duration and updatedAt
          const expireAt = new Date(guild.updatedAt);
          expireAt.setHours(expireAt.getHours() + guild.duration);
          guild.expireAt = expireAt;
        },
      },
    });


  // Update expired records every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      await Guild.update({ modifier: 1 },
        {
          where: {
            expireAt: {
              [Sequelize.Op.lt]: new Date(), // Select records where expireAt is in the past
            },
          },
        });
    } catch (error) {
      console.error('Error updating expired records:', error);
    }
  });

  return Guild;
};