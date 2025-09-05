import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
  tableName: "command_logs",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  indexes: [
    {
      fields: ["command_name"],
    },
    {
      fields: ["command_name", "guildId"],
    },
    {
      fields: ["command_name", "executorId"],
    },
    {
      fields: ["guildId", "executorId"],
    },
    {
      fields: ["guildId", "executorId", "command_name"],
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
    field: "command_name"
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
