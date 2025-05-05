import { Column, DataType, Default, Model, Table } from "sequelize-typescript";
import { v4 as uuidv4 } from "uuid";

export enum UserType {
    ADMIN = "admin",
    USER = "user",
    GUEST = "guest"
}

@Table({
    tableName: "users",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
})
export class User extends Model<User> {
    @Default(() => uuidv4())
    @Column({
        type: DataType.UUID,
        allowNull: false,
        primaryKey: true
    })
    declare id: string; 

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    username!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    email!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    password!: string;

    @Column({
        type: DataType.ENUM,
        values: Object.values(UserType),
        allowNull: false,
    })
    userType!: UserType;
}
