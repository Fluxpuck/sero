import { Table, Column, Model, DataType } from "sequelize-typescript";
import { LapTimes } from "../models/laptimes.model";

export enum CircuitType {
    STREET_CIRCUIT = "Street Circuit",
    PERMANENT_CIRCUIT = "Permanent Circuit",
    HYBRID_CIRCUIT = "Hybrid Circuit",
    HIGH_SPEED_CIRCUIT = "High Speed Circuit",
    TECHNICAL_CIRCUIT = "Technical Circuit",
}

@Table({ tableName: "circuits", timestamps: true })
export class Circuits extends Model {
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name!: string;

    @Column({
        type: DataType.ENUM,
        values: Object.values(CircuitType),
        allowNull: false,
    })
    circuitType!: CircuitType;

    static associate() {
        Circuits.hasMany(LapTimes, {
            foreignKey: 'circuitName',
            sourceKey: 'name',
        });
    }
}