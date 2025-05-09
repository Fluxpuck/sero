import { BeforeSave, Column, DataType, Default, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "user_levels",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    indexes: [
        {
            unique: true,
            fields: ["userId", "guildId"]
        }
    ]
})
export class UserLevel extends Model<UserLevel> {
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
    declare guildId: string;

    @Column({
        type: DataType.BIGINT,
        allowNull: false,
        validate: {
            isNumeric: true
        }
    })
    declare userId: string;

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

    @Default(0)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    rank!: number;

    @Default(0)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    currentLevelExp!: number;

    @Default(100)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    nextLevelExp!: number;

    @Default(100)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    remainingExp!: number;

    @BeforeSave
    static async calculateLevelInfo(instance: UserLevel): Promise<void> {
        // This is where you'd implement your level calculation logic,
        // similar to what you had in the JS version
    }
}
