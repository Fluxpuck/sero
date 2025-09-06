import { Column, DataType, Model, Table } from "sequelize-typescript";

export enum TemplateMessagesType {
  WELCOME = "welcome",
  BIRTHDAY = "birthday",
  BIRTHDAY_WITH_AGE = "birthday-with-age",
  JOB = "job",
  LEVELUP = "levelup",
  REWARD_DROP = "reward-drop",
  CLAIM_REWARD = "claim-reward",
  TREASURE = "treasure",
  AWAY = "away",
}

@Table({
  tableName: "template_messages",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  indexes: [
    {
      unique: true,
      fields: ["guildId", "type"],
    },
    {
      fields: ["id"],
    },
    {
      fields: ["type"],
    },
    {
      fields: ["guildId"],
    },
  ],
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
    allowNull: true,
  })
  declare guildId: string | null;

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
