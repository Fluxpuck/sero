import {
  AfterCreate,
  Column,
  DataType,
  Default,
  Model,
  Table,
} from "sequelize-typescript";
import { Modifier } from "./modifiers.model";

@Table({
  tableName: "guilds",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt",
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ["guildId"],
    },
  ],
  defaultScope: {
    attributes: { exclude: ["deletedAt"] },
  },
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
  static async addModifier(instance: Guild) {
    await Modifier.upsert(
      {
        guildId: instance.guildId,
        amount: 1,
        active: true,
        expireAt: null,
      } as Modifier,
      {
        conflictFields: ["userId", "guildId"],
      }
    );
  }
}
