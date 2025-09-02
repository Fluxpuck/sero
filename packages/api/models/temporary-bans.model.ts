import {
  BeforeCreate,
  BeforeUpdate,
  Column,
  DataType,
  Default,
  Model,
  Table,
} from "sequelize-typescript";

@Table({
  tableName: "temporary_bans",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt",
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ["userId", "guildId"],
    },
  ],
  defaultScope: {
    attributes: { exclude: ["deletedAt"] },
  },
})
export class TemporaryBan extends Model<TemporaryBan> {
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
    type: DataType.STRING,
    allowNull: false,
  })
  declare userId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare reason: string;

  @Default(() => 525600) // 1 year in minutes
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      isInt: true,
      min: 1440,
      max: 525600,
    },
  })
  declare duration: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare expireAt: Date;

  @BeforeCreate
  @BeforeUpdate
  static calculateExpireAt(instance: TemporaryBan): void {
    instance.setDataValue(
      "expireAt",
      new Date(Date.now() + instance.duration * 60 * 1000)
    );
  }
}
