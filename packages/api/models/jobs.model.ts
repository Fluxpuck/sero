import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
  tableName: "jobs",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  indexes: [
    {
      unique: true,
      fields: ["name"],
    },
  ],
})
export class Jobs extends Model<Jobs> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare emoji: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  declare salary: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  declare raise: number;
}
