import { Column, DataType, Default, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "user_careers",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    indexes: [
        {
            unique: true,
            fields: ["userId", "guildId"]
        }
    ]
})
export class UserCareers extends Model<UserCareers> {
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
        type: DataType.INTEGER,
        allowNull: false,
        validate: {
            isNumeric: true
        }
    })
    declare jobId: number;

    @Default(0)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    experience!: number;

    @Default(0)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    level!: number;

}
