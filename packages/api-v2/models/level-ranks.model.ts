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
        type: DataType.BIGINT,
        allowNull: false,
        validate: {
            isNumeric: true
        }
    })
    declare guildId: number;

    @Column({
        type: DataType.FLOAT,
        allowNull: false,
    })
    declare level: number;

    @Column({
        type: DataType.BIGINT,
        allowNull: true,
        validate: {
            isNumeric: true
        }
    })
    declare roleId: number;
}
