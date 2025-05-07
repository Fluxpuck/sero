import { Column, DataType, Default, Model, Table } from "sequelize-typescript";

export enum UserExperienceLogType {
    TRANSFER = "transfer",
    GIVE = "give",
    REMOVE = "remove",
    CLAIM = "claim"
}


@Table({
    tableName: "user_experience_logs",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    indexes: [
        {
            unique: true,
            fields: ["userId", "guildId"]
        },
    ]
})
export class UserExperienceLogs extends Model<UserExperienceLogs> {
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
        type: DataType.ENUM,
        values: Object.values(UserExperienceLogType),
        allowNull: false,
    })
    type!: UserExperienceLogType;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        validate: {
            isNumeric: true
        }
    })
    amount!: number;

    @Column({
        type: DataType.BIGINT,
        allowNull: true,
        validate: {
            isNumeric: true
        }
    })
    originId!: number | null;

}
