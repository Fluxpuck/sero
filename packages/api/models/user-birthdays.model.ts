import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
  tableName: "user_birthdays",
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
export class UserBirthdays extends Model<UserBirthdays> {
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
    allowNull: false,
    validate: {
      isNumeric: true,
    },
  })
  declare userId: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: {
      isInt: true,
      min: 1900,
      max: 2100,
    },
  })
  declare year: number | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      isInt: true,
      min: 1,
      max: 12,
    },
  })
  declare month: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      isInt: true,
      min: 1,
      max: 31,
    },
  })
  declare day: number;
}
