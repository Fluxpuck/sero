import {
  AfterCreate,
  Column,
  DataType,
  Default,
  Model,
  Table,
} from "sequelize-typescript";
import { LevelMultiplier } from "./level-multiplier.model";

@Table({
  tableName: "guilds",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  indexes: [
    {
      unique: true,
      fields: ["guildId"],
    },
  ],
})
export class Guild extends Model<Guild> {
  public hasPremium(): boolean {
    return this.premium;
  }

  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare guildId: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare guildName: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  declare premium: boolean;

  @AfterCreate
  static async addMultiplier(instance: Guild) {
    await LevelMultiplier.upsert(
      {
        guildId: instance.guildId,
        amount: 1,
        active: true,
        expireAt: null,
      } as LevelMultiplier,
      {
        conflictFields: ["userId", "guildId"],
      }
    );
  }
}
