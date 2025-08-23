import { Column, DataType, Model, Table } from "sequelize-typescript";

export enum TemplateMessagesType {
  BIRTHDAY = "birthday",
  JOB = "job",
  LEVELUP = "levelup",
  REWARD_DROP = "reward-drop",
  CLAIM_REWARD = "claim-reward",
}

@Table({
  tableName: "template_messages",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  deletedAt: "deletedAt",
  paranoid: true,
  indexes: [
    {
      unique: true,
      fields: ["guildId", "type"],
    },
  ],
  defaultScope: {
    attributes: { exclude: ["deletedAt"] },
  },
})
export class TemplateMessages extends Model<TemplateMessages> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare guildId: string;

  @Column({
    type: DataType.ENUM,
    values: Object.values(TemplateMessagesType),
    allowNull: false,
  })
  declare type: TemplateMessagesType;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare message: string;
}
