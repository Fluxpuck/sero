import { Column, DataType, Default, Model, Table } from "sequelize-typescript";

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
        type: DataType.BIGINT,
        allowNull: false,
        validate: {
            isNumeric: true
        }
    })
    duration!: number;


}
