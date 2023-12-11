const { Model, DataTypes } = require("sequelize");

class Guild extends Model {
  static associate(models) {
    // this.hasMany(models.User, { foreignKey: 'guildId' });
    // this.hasMany(models.Messages, { foreignKey: 'guildId' });
    // this.hasMany(models.EventChannels, { foreignKey: 'guildId' });
    // this.hasMany(models.AuditLogs, { foreignKey: 'guildId' });
    // this.hasMany(models.EventChannels, { foreignKey: 'guildId' });
  }
}

module.exports = sequelize => {
  Guild.init({
    guildId: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      unique: true,
      validate: {
        is: /^\d{17,20}$/ //Discord Snowflake
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
    }
  },
    {
      sequelize,
      modelName: 'guild',
      timestamps: true,
      createdAt: true
    },
  );
  
  return Guild;
}
