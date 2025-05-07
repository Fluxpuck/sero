import { Column, DataType, ForeignKey, Model, Table } from "sequelize-typescript";
import { Guild } from "./guilds.model";

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

    @ForeignKey(() => Guild)
    @Column({
        type: DataType.BIGINT,
        allowNull: false
    })
    declare guildId: number;

    @Column({
        type: DataType.INTEGER,
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
