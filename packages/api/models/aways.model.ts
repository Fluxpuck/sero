import { BeforeCreate, BeforeUpdate, Column, DataType, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "aways",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    indexes: [
        {
            unique: true,
            fields: ["guildId", "userId"]
        },
        {
            fields: ["expireAt"]
        },
        {
            fields: ["guildId"]
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
        validate: {
            isNumeric: true
        }
    })
    declare guildId: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        validate: {
            isNumeric: true
        }
    })
    declare userId: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare message: string | null;

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
    static checkExpiration(instance: Aways) {
        // If expiration date exists and has passed
        if (instance.expireAt && new Date() > instance.expireAt) {
            instance.destroy();
        }
    }

}

