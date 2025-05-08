import { BeforeCreate, BeforeUpdate, Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "bot_config",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    deletedAt: "deletedAt",
    paranoid: true,
    indexes: []
})

export class BotConfig extends Model<BotConfig> {
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
