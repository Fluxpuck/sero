import { Column, DataType, Default, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "command_logs",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    indexes: [
        {
            fields: ["id", "guildId"]
        }
    ]
})
export class CommandLogs extends Model<CommandLogs> {
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
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    })
    declare commandId: number;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    name!: string

    @Column({
        type: DataType.BIGINT,
        allowNull: true,
        validate: {
            isNumeric: true
        }
    })
    declare executorId: number | null;

}
