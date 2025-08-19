import {
  BeforeSave,
  Column,
  DataType,
  Default,
  Model,
  Table,
} from "sequelize-typescript";
import { calculateLevel, calculateRank } from "../utils/levels.utils";
import { publish, RedisChannel } from "../utils/publisher";

@Table({
  tableName: "user_levels",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  indexes: [
    {
      unique: true,
      fields: ["userId", "guildId"],
    },
  ],
})
export class UserLevel extends Model<UserLevel> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isNumeric: true,
    },
  })
  declare guildId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isNumeric: true,
    },
  })
  declare userId: string;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare experience: number;

  @Default(1)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare level: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare rank: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare currentLevelExp: number;

  @Default(100)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare nextLevelExp: number;

  @Default(100)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare remainingExp: number;

  @BeforeSave
  static async levelCalculations(userLevel: UserLevel): Promise<void> {
    // Store previous Level record
    const previousLevel = userLevel.level;

    // Check if the user has reached a new level
    const newLevel = await calculateLevel(userLevel);

    userLevel.level = newLevel.level;
    userLevel.currentLevelExp = newLevel.currentLevelExp;
    userLevel.nextLevelExp = newLevel.nextLevelExp;
    userLevel.remainingExp = newLevel.remainingExp;

    // Update rank information if level has changed
    if (previousLevel !== newLevel.level) {
      const newRank = await calculateRank(userLevel);
      userLevel.rank = newRank.rank;

      // Publish a message
      publish(RedisChannel.GUILD_MEMBER_LEVEL, userLevel);
    }
  }
}
