import {
  BeforeCreate,
  BeforeUpdate,
  Column,
  DataType,
  Default,
  Model,
  Table,
} from "sequelize-typescript";

export type LevelMultiplierType = "server" | "personal";

@Table({
  tableName: "multipliers",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  indexes: [
    {
      fields: ["guildId"],
    },
    {
      unique: true,
      fields: ["guildId", "userId"],
    },
    {
      fields: ["type"],
    },
    {
      fields: ["expireAt"],
    },
  ],
})
export class LevelMultiplier extends Model<LevelMultiplier> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isNumeric: true,
    },
  })
  declare guildId: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare userId: string | null;

  @Default("server")
  @Column({
    type: DataType.ENUM("server", "personal"),
    allowNull: false,
  })
  declare type: LevelMultiplierType;

  @Default(1)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      max: 10,
    },
  })
  declare multiplier: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: {
      isInt: true,
      min: 0,
    },
  })
  declare duration: number | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare expireAt: Date | null;

  get hasActiveBoost(): boolean {
    return (
      this.multiplier > 1 &&
      (this.expireAt ? new Date() < this.expireAt : false)
    );
  }

  @BeforeCreate
  @BeforeUpdate
  static calculateExpireAt(instance: LevelMultiplier): void {
    if (instance.duration) {
      instance.setDataValue(
        "expireAt",
        new Date(Date.now() + instance.duration * 1000)
      );
    }
  }

  @BeforeCreate
  @BeforeUpdate
  static async setType(instance: LevelMultiplier): Promise<void> {
    if (instance.userId) {
      instance.setDataValue("type", "personal");
    } else {
      instance.setDataValue("type", "server");
    }
  }
}
