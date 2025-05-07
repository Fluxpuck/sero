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
export class Level extends Model<Level> {
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
        allowNull: false,
        validate: {
            min: 0
        }
    })
    declare experience: number;
}
