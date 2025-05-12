import { BeforeCreate, BeforeUpdate, Column, DataType, Model, Table } from "sequelize-typescript";

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
    ],
    defaultScope: {
        attributes: { exclude: ['deletedAt'] }
    }
})
export class TemporaryRole extends Model<TemporaryRole> {
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
        type: DataType.STRING,
        allowNull: false
    })
    declare userId: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare roleId: string;

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

    @BeforeCreate
    @BeforeUpdate
    static checkExpiration(instance: TemporaryRole): void {
        // If expiration date exists and has passed, set active to false
        if (instance.expireAt && new Date() > instance.expireAt) {
            instance.setDataValue('duration', 1);
        }
    }
}
