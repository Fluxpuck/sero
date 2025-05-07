import { Column, DataType, Default, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "user_economy_logs",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    indexes: [
        {
            unique: true,
            fields: ["userId", "guildId"]
        }
    ]
})
export class UserEconomyLogs extends Model<UserEconomyLogs> {
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
        values: ["transfer", "give", "remove"],
        allowNull: false,
    })
    type!: "transfer" | "give" | "remove";

    @Column({
        type: DataType.BIGINT,
        allowNull: false,
        validate: {
            isNumeric: true
        }
    })
    amount!: number;

}
