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
        },
        {
            fields: ["channelId"]
        },
        {
            fields: ["type"]
        },
        {
            fields: ["guildId"]
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
        type: DataType.STRING,
        allowNull: false,
        validate: {
            isNumeric: true
        }
    })
    declare guildId: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        validate: {
            isNumeric: true
        }
    })
    declare userId: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        validate: {
            isNumeric: true
        }
    })
    declare channelId: string;

    @Column({
        type: DataType.ENUM,
        values: Object.values(UserVoiceLogType),
        allowNull: false,
    })
    declare type: UserVoiceLogType;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        validate: {
            isNumeric: true
        }
    })
    declare duration: number | null;

}
