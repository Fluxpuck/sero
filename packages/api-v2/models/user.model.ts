import { Column, DataType, Default, Model, Table } from "sequelize-typescript";

export enum UserType {
    ADMIN = "admin",
    MODERATOR = "moderator",
    USER = "user"
}

@Table({
    tableName: "users",
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
export class Users extends Model<Users> {
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
        type: DataType.STRING(100),
        allowNull: false,
    })
    username!: string;

    @Default(false)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
    })
    premium!: boolean;

    @Default(() => UserType.USER)
    @Column({
        type: DataType.ENUM,
        values: Object.values(UserType),
        allowNull: false,
    })
    userType!: UserType;
}
