import { Column, DataType, Default, Model, Table } from "sequelize-typescript";

export enum UserExperienceLogType {
  TRANSFER = "transfer",
  GIVE = "give",
  REMOVE = "remove",
  CLAIM = "claim",
  GAIN = "gain",
}

@Table({
  tableName: "user_experience_logs",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  indexes: [
    {
      fields: ["userId", "guildId"],
    },
  ],
})
export class UserExperienceLogs extends Model<UserExperienceLogs> {
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
    allowNull: true,
    validate: {
      isNumeric: true,
    },
  })
  declare originId: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    validate: {
      isNumeric: true,
    },
  })
  declare targetId: string | null;

  @Column({
    type: DataType.ENUM,
    values: Object.values(UserExperienceLogType),
    allowNull: false,
  })
  declare type: UserExperienceLogType;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      isNumeric: true,
    },
  })
  declare amount: number;
}
