import { Table, Column, Model, DataType } from "sequelize-typescript";
import { Circuits } from "../models/circuits.model";

@Table({ tableName: "laptimes", timestamps: true })
export class LapTimes extends Model {
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    circuitName!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    lapTime!: string;

    static associate() {
        LapTimes.belongsTo(Circuits, {
            foreignKey: 'circuitName',
            targetKey: 'name',
        });
    }
}