import {
  AfterCreate,
  Column,
  DataType,
  Default,
  Model,
  Table,
} from "sequelize-typescript";
import { GuildLevelMultiplier } from "./multiplier.model";

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
    await GuildLevelMultiplier.upsert(
      {
        guildId: instance.guildId,
        multiplier: 1,
      } as GuildLevelMultiplier,
      {
        returning: true,
      }
    );
  }
}
