import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
  tableName: "bot_config",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  indexes: [
    {
      unique: true,
      fields: ["client_id"],
    },
  ],
})
export class BotConfig extends Model<BotConfig> {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
  })
  declare client_id: string;

  // Global bot configuration parameters can be stored here
}
