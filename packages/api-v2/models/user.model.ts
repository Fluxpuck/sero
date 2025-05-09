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
export class User extends Model<User> {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    })
    declare id: number;

    @Default(DataType.UUIDV4)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    declare uuid: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare userId: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare guildId: string;

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
