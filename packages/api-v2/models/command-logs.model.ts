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
        unique: true,
    })
    declare commandId: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare name: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        validate: {
            isNumeric: true
        }
    })
    declare executorId: string | null;

}
