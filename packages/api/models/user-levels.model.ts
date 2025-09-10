import {
  BeforeSave,
  Column,
  DataType,
  Default,
  Model,
  Table,
} from "sequelize-typescript";
import { calculateLevel, calculateRank } from "../utils/levels.utils";
import { publish, RedisChannel } from "../redis/publisher";

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
  // Store the fluctuation value for the current save operation
  private _currentFluctuation: number = 0;

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

  get fluctuation(): number {
    return this._currentFluctuation || 0;
  }

  // Override toJSON to include virtual fields
  toJSON() {
    const values = super.toJSON();
    return {
      ...values,
      fluctuation: this.fluctuation,
    };
  }

  @BeforeSave
  static async beforeSaveHook(userLevel: UserLevel): Promise<void> {
    // Calculate fluctuation if experience has changed
    if (userLevel.changed("experience")) {
      const currentExp = userLevel.getDataValue("experience") || 0;
      const previousExp = userLevel.previous("experience") || 0;
      userLevel._currentFluctuation = currentExp - previousExp;
    }

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
