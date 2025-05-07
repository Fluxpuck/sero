import { Column, DataType, Default, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "temporary_roles",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    deletedAt: "deletedAt",
    paranoid: true,
    indexes: [
        {
            unique: true,
            fields: ["userId", "guildId", "roleId"]
        }
    ]
})
export class UserLevels extends Model<UserLevels> {
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
        type: DataType.BIGINT,
        allowNull: false,
        validate: {
            isNumeric: true
        }
    })
    declare userId: number;

    @Column({
        type: DataType.BIGINT,
        allowNull: false,
        validate: {
            isNumeric: true
        }
    })
    declare roleId: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        validate: {
            isInt: true,
            min: 0
        }
    })
    declare duration: number | null;

    @Column({
        type: DataType.DATE,
        allowNull: true
    })
    declare expireAt: Date | null;

}
