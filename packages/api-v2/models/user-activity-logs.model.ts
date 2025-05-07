import { Column, DataType, Model, Table } from "sequelize-typescript";

export enum UserActivityLogsType {
    UPDATE_USERNAME = "update-username",
    UPDATE_PROFILE_PIC = "update-profile-pic",
}

@Table({
    tableName: "user_activity_logs",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    indexes: [
        {
            fields: ["userId", "guildId"]
        }
    ]
})
export class UserActivityLogs extends Model<UserActivityLogs> {
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
        values: Object.values(UserActivityLogsType),
        allowNull: false,
    })
    type!: UserActivityLogsType;

    @Column({
        type: DataType.JSON,
        allowNull: true,
    })
    declare additional: Record<string, any>;

}
