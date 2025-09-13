import {
  AfterCreate,
  BeforeSave,
  Column,
  DataType,
  Default,
  Model,
  Table,
} from "sequelize-typescript";
import { UserLevel, UserBalances, UserLevelMultiplier } from "../models";

export enum UserType {
  ADMIN = "admin",
  MODERATOR = "moderator",
  USER = "user",
}

@Table({
  tableName: "users",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  indexes: [
    {
      unique: true,
      fields: ["userId", "guildId"],
    },
  ],
})
export class User extends Model<User> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Default(DataType.UUIDV4)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    unique: true,
  })
  declare uuid: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare userId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare guildId: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare username: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  declare premium: boolean;

  @Default(() => UserType.USER)
  @Column({
    type: DataType.ENUM,
    values: Object.values(UserType),
    allowNull: false,
  })
  declare userType: UserType;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare moderatorSince: Date | null;

  @BeforeSave
  static async updateModeratorSince(instance: User) {
    // Check if this is an existing record being updated
    if (instance.isNewRecord === false) {
      // Get the previous state of the instance
      const previousInstance = await User.findByPk(instance.id);

      // If previous instance exists and userType is changing from USER to ADMIN or MODERATOR
      if (
        previousInstance &&
        previousInstance.userType === UserType.USER &&
        (instance.userType === UserType.ADMIN ||
          instance.userType === UserType.MODERATOR)
      ) {
        // Set moderatorSince to current date
        instance.moderatorSince = new Date();
      }
    }
  }

  @AfterCreate
  static async addMultiplier(instance: User) {
    await Promise.all([
      UserLevel.upsert({
        guildId: instance.guildId,
        userId: instance.userId,
      } as UserLevel),
      UserBalances.upsert({
        guildId: instance.guildId,
        userId: instance.userId,
      } as UserBalances),
      UserLevelMultiplier.upsert({
        guildId: instance.guildId,
        userId: instance.userId,
      } as UserLevelMultiplier),
    ]);
  }
}
