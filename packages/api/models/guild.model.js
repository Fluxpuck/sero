const { Model, DataTypes } = require("sequelize");

class Guild extends Model {
  static associate(models) {
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
