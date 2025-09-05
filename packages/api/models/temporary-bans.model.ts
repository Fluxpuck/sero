import {
  BeforeBulkCreate,
  BeforeBulkUpdate,
  BeforeCreate,
  BeforeUpdate,
  Column,
  DataType,
  Default,
  Model,
  Table,
} from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";

@Table({
  tableName: "temporary_bans",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt",
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ["auditLogId"],
    },
    {
      unique: false,
      fields: ["userId", "guildId"],
    },
  ],
  defaultScope: {
    attributes: { exclude: ["deletedAt"] },
  },
})
export class TemporaryBan extends Model<TemporaryBan> {
  @Default(() => uuidv4())
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare auditLogId: string;

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

  @Default(() => 31536000) // 1 year in seconds (60*60*24*365)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
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
      new Date(Date.now() + instance.duration * 1000)
    );
  }
}
