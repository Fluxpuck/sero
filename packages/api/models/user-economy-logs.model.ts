import { Column, DataType, Default, Model, Table } from "sequelize-typescript";

export enum EconomyLogType {
  TRANSFER = "transfer",
  GIVE = "give",
  REMOVE = "remove",
  WORK = "work",
  TREASURE_HUNT = "treasure-hunt",
}

@Table({
  tableName: "user_economy_logs",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  indexes: [
    {
      fields: ["userId", "guildId"],
    },
  ],
})
export class UserEconomyLogs extends Model<UserEconomyLogs> {
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
    values: Object.values(EconomyLogType),
    allowNull: false,
  })
  declare type: EconomyLogType;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      isNumeric: true,
    },
  })
  declare amount: number;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  declare additional: Record<string, any>;
}
