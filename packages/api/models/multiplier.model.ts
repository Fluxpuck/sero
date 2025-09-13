import {
  BeforeCreate,
  BeforeUpdate,
  Column,
  DataType,
  Default,
  Model,
  Table,
} from "sequelize-typescript";

@Table({
  tableName: "guild-level-multipliers",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  indexes: [
    {
      unique: true,
      fields: ["guildId"],
    },
    {
      fields: ["expireAt"],
    },
  ],
})
export class GuildLevelMultiplier extends Model<GuildLevelMultiplier> {
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
  static calculateExpireAt(instance: UserLevelMultiplier): void {
    if (instance.duration) {
      instance.setDataValue(
        "expireAt",
        new Date(Date.now() + instance.duration * 1000)
      );
    }
  }
}

@Table({
  tableName: "user-level-multipliers",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  indexes: [
    {
      unique: true,
      fields: ["guildId", "userId"],
    },
    {
      fields: ["expireAt"],
    },
  ],
})
export class UserLevelMultiplier extends Model<UserLevelMultiplier> {
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
    allowNull: false,
    validate: {
      isNumeric: true,
    },
  })
  declare userId: string;

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
  static calculateExpireAt(instance: UserLevelMultiplier): void {
    if (instance.duration) {
      instance.setDataValue(
        "expireAt",
        new Date(Date.now() + instance.duration * 1000)
      );
    }
  }
}
