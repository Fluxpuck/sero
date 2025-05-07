import { Column, DataType, Default, Model, Table } from "sequelize-typescript";

export enum UserType {
    ADMIN = "admin",
    MODERATOR = "moderator",
    USER = "user"
}

@Table({
    tableName: "user_levels",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    deletedAt: "deletedAt",
    paranoid: true,
    indexes: [
        {
            unique: true,
            fields: ["userId", "guildId"]
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
    declare userId: number;

    @Column({
        type: DataType.BIGINT,
        allowNull: false,
        validate: {
            isNumeric: true
        }
    })
    declare guildId: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    })
    declare experience: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    })
    declare currentLevelExp: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    })
    declare nextLevelExp: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0
        }
    })
    declare remainingExp: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 1
        }
    })
    declare level: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        validate: {
            min: 1
        }
    })
    declare rank: number;


}
