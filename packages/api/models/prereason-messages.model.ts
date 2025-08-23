import { Column, DataType, Model, Table } from "sequelize-typescript";

export enum ModerationType {
  BAN = "ban",
  KICK = "kick",
  MUTE = "mute",
  UNBAN = "unban",
  UNMUTE = "unmute",
}

@Table({
  tableName: "prereason_messages",
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
export class PrereasonMessages extends Model<PrereasonMessages> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.ENUM,
    values: Object.values(ModerationType),
    allowNull: false,
  })
  declare type: ModerationType;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare message: string;
}
