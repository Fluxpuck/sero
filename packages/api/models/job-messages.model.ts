import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
  tableName: "job_messages",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt",
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ["id"],
    },
  ],
  defaultScope: {
    attributes: { exclude: ["deletedAt"] },
  },
})
export class JobMessages extends Model<JobMessages> {
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
  declare jobId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare message: string;
}
