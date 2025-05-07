import { Column, DataType, Default, Model, Table } from "sequelize-typescript";

export enum UserVoiceLogType {
    ACTIVE = "active",
    TRANSFERRED = "transferred",
    DISCONNECTED = "disconnected"
}

@Table({
    tableName: "user_voice_logs",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    indexes: [
        {
            unique: true,
            fields: ["userId", "guildId"]
        }
    ]
})
export class UserVoiceLogs extends Model<UserVoiceLogs> {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    })
    declare id: number;

    @Column({
        type: DataType.BIGINT,
        allowNull: false,
        validate: {
            isNumeric: true
        }
    })
    declare guildId: number;

    @Column({
        type: DataType.BIGINT,
        allowNull: false,
        validate: {
            isNumeric: true
        }
    })
    declare userId: number;

    @Column({
        type: DataType.BIGINT,
        allowNull: false,
        validate: {
            isNumeric: true
        }
    })
    declare channelId: number;

    @Column({
        type: DataType.ENUM,
        values: Object.values(UserVoiceLogType),
        allowNull: false,
    })
    type!: UserVoiceLogType;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        validate: {
            isNumeric: true
        }
    })
    duration!: number | null;

}
