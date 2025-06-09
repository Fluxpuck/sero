import { BeforeCreate, Column, DataType, Default, Model, Table } from "sequelize-typescript";
import { Modifier } from "./modifiers.model";

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
    ],
    defaultScope: {
        attributes: { exclude: ['deletedAt'] }
    }
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
        unique: true,
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
    declare username: string;

    @Default(false)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
    })
    declare premium: boolean;

    @Default(() => UserType.USER)
    @Column({
        type: DataType.ENUM,
        values: Object.values(UserType),
        allowNull: false,
    })
    declare userType: UserType;

    @BeforeCreate
    static async addModifier(instance: User) {
        await Modifier.upsert({
            guildId: instance.guildId,
            userId: instance.userId,
            amount: 1,
            active: true,
            expireAt: null,
        } as Modifier, {
            conflictFields: ['guildId', 'userId']
        });
    }
}
