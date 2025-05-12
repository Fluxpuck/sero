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
    ],
    defaultScope: {
        attributes: { exclude: ['deletedAt'] }
    }
})
export class Guild extends Model<Guild> {
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
        type: DataType.STRING(100),
        allowNull: false,
    })
    declare guildName: string;

    @Default(false)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
    })
    declare premium: boolean;
}
