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
    ],
    defaultScope: {
        attributes: { exclude: ['deletedAt'] }
    }
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
        type: DataType.STRING,
        allowNull: false,
        validate: {
            isNumeric: true
        }
    })
    declare guildId: string;

    @Column({
        type: DataType.ENUM(...Object.keys(AuditLogEvent).filter(k => isNaN(Number(k)))),
        allowNull: false,
    })
    declare action: keyof typeof AuditLogEvent;

    @Default(null)
    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare reason: string | null;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        validate: {
            isNumeric: true
        }
    })
    declare targetId: string | null;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        validate: {
            isNumeric: true
        }
    })
    declare executorId: string | null;

}
