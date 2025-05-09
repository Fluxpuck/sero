import { Column, DataType, Default, Model, Table } from "sequelize-typescript";
import { Op } from "sequelize";

@Table({
    tableName: "messages",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    deletedAt: "deletedAt",
    paranoid: true,
    indexes: [
        {
            unique: true,
            fields: ["messageId"]
        },
        {
            unique: false,
            fields: ["guildId"]
        },
        {
            unique: false,
            fields: ["channelId"]
        },
        {
            unique: false,
            fields: ["userId", "guildId"]
        }
    ]
})
export class Messages extends Model<Messages> {
        static async findByGuildId(
            guildId: string,
            options?: {
                channelId?: string;
                userId?: string;
                dateRange?: { startDate: Date; endDate: Date }
            }
        ): Promise<Messages[]> {
            const whereClause: any = { guildId };

            if (options?.channelId) {
                whereClause.channelId = options.channelId;
            }

            if (options?.userId) {
                whereClause.userId = options.userId;
            }

            if (options?.dateRange) {
                whereClause.createdAt = {
                    [Op.between]: [options.dateRange.startDate, options.dateRange.endDate]
                };
            }

            return await this.findAll({ where: whereClause });
        } @Column({
            type: DataType.STRING,
            primaryKey: true,
            allowNull: false
        })
    declare messageId: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare guildId: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare channelId: string;

    @Column({
        type: DataType.STRING,
        allowNull: false
    })
    declare userId: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare content: string;

}

