import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "level_ranks",
    indexes: [
        {
            unique: true,
            fields: ["guildId", "level"]
        }
    ]
})
export class LevelRank extends Model<LevelRank> {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    })
    declare id: number;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare guildId: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare level: number;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        validate: {
            isNumeric: true
        }
    })
    declare roleId: string;
}
