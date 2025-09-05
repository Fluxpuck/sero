import { BeforeCreate, BeforeUpdate, Column, DataType, Default, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "modifiers",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    indexes: [
        {
            fields: ["guildId"]
        },
        {
            unique: true,
            fields: ["guildId", "userId"]
        },
    ]
})
export class Modifier extends Model<Modifier> {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    })
    declare id: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        validate: {
            isNumeric: true
        }
    })
    declare guildId: string;

    @Column({
        type: DataType.STRING,
        allowNull: true
    })
    declare userId: string | null;

    @Default(1)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        validate: {
            max: 10
        }
    })
    declare amount: number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true
    })
    declare active: boolean;

    @Column({
        type: DataType.DATE,
        allowNull: true
    })
    declare expireAt: Date | null;

    @BeforeCreate
    @BeforeUpdate
    static checkExpiration(instance: Modifier) {
        // If expiration date exists and has passed
        if (instance.expireAt && new Date() > instance.expireAt) {
            instance.active = false;
            instance.amount = 1;
        }
    }
}
