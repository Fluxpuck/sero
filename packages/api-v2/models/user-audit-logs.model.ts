import { Column, DataType, Default, Model, Table } from "sequelize-typescript";
import { AuditLogEvent } from "discord.js";
import { v4 as uuidv4 } from "uuid";

@Table({
    tableName: "user_audit_logs",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    deletedAt: "deletedAt",
    paranoid: true,
    indexes: [
        {
            fields: ["guildId"]
        }
    ]
})
export class UserAuditLogs extends Model<UserAuditLogs> {
    @Default(() => uuidv4())
    @Column({
        type: DataType.UUID,
        allowNull: false,
        primaryKey: true
    })
    declare id: string;

    @Column({
        type: DataType.BIGINT,
        allowNull: false,
        validate: {
            isNumeric: true
        }
    })
    declare guildId: number;

    @Column({
        type: DataType.ENUM(...Object.keys(AuditLogEvent).filter(k => isNaN(Number(k)))),
        allowNull: false,
    })
    action!: keyof typeof AuditLogEvent;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    reason: string | null = null;

    // Related to the user who was affected by the action
    @Column({
        type: DataType.BIGINT,
        allowNull: true,
        validate: {
            isNumeric: true
        }
    })
    declare targetId: number | null;

    // Related to the user who performed the action
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        validate: {
            isNumeric: true
        }
    })
    declare executorId: number | null;

}
