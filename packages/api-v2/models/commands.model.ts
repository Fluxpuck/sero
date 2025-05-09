import { Column, DataType, Model, Table } from "sequelize-typescript";
import { ApplicationCommandOptionData, ApplicationCommandType, PermissionResolvable } from "discord.js";

@Table({
    tableName: "commands",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    indexes: [
        {
            unique: true,
            fields: ["commandId"]
        }
    ]
})
export class Commands extends Model<Commands> {

    @Column({
        type: DataType.STRING,
        primaryKey: true,
    })
    declare commandId: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare name: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare description: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare usage: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare interactionType: ApplicationCommandType;

    @Column({
        type: DataType.JSON,
        allowNull: true,
    })
    declare interactionOptions: ApplicationCommandOptionData[] | null;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare defaultMemberPermissions: PermissionResolvable | null;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    declare cooldown: number | null;

}
