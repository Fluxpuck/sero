import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
  tableName: "command_logs",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  indexes: [
    {
      fields: ["commandName"],
    },
    {
      fields: ["commandName", "guildId"],
    },
    {
      fields: ["commandName", "executorId"],
    },
    {
      fields: ["guildId", "executorId"],
    },
    {
      fields: ["guildId", "executorId", "commandName"],
    },
  ],
})
export class CommandLogs extends Model<CommandLogs> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare commandName: string;

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
  declare executorId: string | null;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare commandOptions: Record<string, any> | null;
}
