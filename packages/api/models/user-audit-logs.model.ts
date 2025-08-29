import { Column, DataType, Default, Model, Table } from "sequelize-typescript";
import { AuditLogEvent } from "discord.js";
import { v4 as uuidv4 } from "uuid";

export enum CustomAuditLogEvent {
  MemberTimeoutAdd = "MemberTimeoutAdd",
  MemberTimeoutRemove = "MemberTimeoutRemove",
}

export type AuditLogEventType = AuditLogEvent | CustomAuditLogEvent;

@Table({
  tableName: "user_audit_logs",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt",
  paranoid: true,
  indexes: [
    {
      fields: ["guildId"],
    },
  ],
  defaultScope: {
    attributes: { exclude: ["deletedAt"] },
  },
})
export class UserAuditLogs extends Model<UserAuditLogs> {
  @Default(() => uuidv4())
  @Column({
    type: DataType.UUID,
    allowNull: false,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare guildId: string;

  @Column({
    type: DataType.ENUM(
      ...Object.keys(AuditLogEvent).filter((k) => isNaN(Number(k))),
      ...Object.keys(CustomAuditLogEvent)
    ),
    allowNull: false,
  })
  declare action: AuditLogEventType;

  @Default(null)
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare reason: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare targetId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare executorId: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare duration: number | null;
}
