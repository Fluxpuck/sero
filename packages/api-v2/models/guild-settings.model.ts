import { Column, DataType, Model, Table } from "sequelize-typescript";

export enum GuildSettingType {
    ADMIN_ROLE = "admin-role",
    MODERATOR_ROLE = "moderator-role",

    WELCOME_CHANNEL = "welcome-channel",
    LEVEL_UP_CHANNEL = "level-up-channel",
    EXP_REWARD_DROP_CHANNEL = "exp-reward-drop-channel",

    BIRTHDAY_ROLE = "birthday-role",
    BIRTHDAY_MESSAGE_CHANNEL = "birthday-message-channel",

    MEMBER_LOGS_CHANNEL = "member-logs-channel",
    BAN_LOGS_CHANNEL = "ban-logs-channel",
    VC_LOGS_CHANNEL = "vc-logs-channel",
}

@Table({
    tableName: "guild_settings",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    indexes: [
        {
            unique: true,
            fields: ["guildId"]
        }
    ]
})
export class GuildSettings extends Model<GuildSettings> {
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
        type: DataType.ENUM,
        values: Object.values(GuildSettingType),
        allowNull: false,
    })
    declare type: GuildSettingType;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    declare typeId: number;

    @Column({
        type: DataType.JSON,
        allowNull: true,
    })
    declare excludeIds: number[];

}
