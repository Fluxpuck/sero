import { Column, DataType, Model, Table } from "sequelize-typescript";
import { differenceInYears } from "date-fns";

@Table({
  tableName: "user_birthdays",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
  indexes: [
    {
      unique: true,
      fields: ["userId", "guildId"],
    },
  ],
})
export class UserBirthdays extends Model<UserBirthdays> {
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

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: {
      isInt: true,
      min: 1900,
      max: 2100,
    },
  })
  declare year: number | null;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      isInt: true,
      min: 1,
      max: 12,
    },
  })
  declare month: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      isInt: true,
      min: 1,
      max: 31,
    },
  })
  declare day: number;

  // Virtual field for age
  get age(): number | null {
    if (!this.year) return null;
    const birthDate = new Date(this.year, this.month - 1, this.day);
    return differenceInYears(new Date(), birthDate);
  }

  // Virtual field for isPG
  get isPG(): boolean {
    const age = this.age;
    return age !== null && age >= 13;
  }

  // Check if birthday has been updated, if so, lock it
  get locked(): boolean {
    return this.createdAt.getTime() !== this.updatedAt.getTime();
  }

  // Override toJSON to include virtual fields
  toJSON() {
    const values = super.toJSON();
    return {
      ...values,
      age: this.age,
      isPG: this.isPG,
      locked: this.locked,
    };
  }
}
