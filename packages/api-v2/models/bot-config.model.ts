import { BeforeCreate, BeforeUpdate, Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "aways",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    deletedAt: "deletedAt",
    paranoid: true,
    indexes: [
        {
            unique: true,
            fields: ["guildId", "userId"]
        }
    ]
})
export class Aways extends Model<Aways> {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    })
    declare id: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare timezone: string;

}

