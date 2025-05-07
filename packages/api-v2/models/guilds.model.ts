import { Column, DataType, Default, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "guilds",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    deletedAt: "deletedAt",
    paranoid: true,
    indexes: [
        {
            unique: true,
            fields: ["guildId"]
        }
    ]
})
export class Guilds extends Model<Guilds> {
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
        type: DataType.STRING(100),
        allowNull: false,
    })
    guildName!: string;

    @Default(false)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
    })
    premium!: boolean;
}
