import { Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "levels",
    indexes: [
        {
            unique: true,
            fields: ["level"]
        }
    ]
})
export class Levels extends Model<Levels> {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    })
    declare id: number;

    @Column({
        type: DataType.FLOAT,
        allowNull: false,
    })
    declare level: number;

    @Column({
        type: DataType.FLOAT,
        allowNull: true,
    })
    declare experience: number;
}
