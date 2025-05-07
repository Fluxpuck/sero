import { Column, DataType, Default, Model, Table } from "sequelize-typescript";

@Table({
    tableName: "user_birthdays",
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    deletedAt: "deletedAt",
    paranoid: true,
    indexes: [
        {
            unique: true,
            fields: ["userId", "guildId"]
        }
    ]
})
export class UserBirthdays extends Model<UserBirthdays> {
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
        type: DataType.BIGINT,
        allowNull: false,
        validate: {
            isNumeric: true
        }
    })
    declare userId: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        validate: {
            isInt: true,
            min: 1900,
            max: 2100
        }
    })
    declare year: number | null;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 1,
            max: 12
        }
    })
    declare month: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 1,
            max: 31
        }
    })
    declare day: number;

    @Column({
        type: DataType.VIRTUAL,
    })
    get isValidDate(): boolean {
        const date = new Date(this.year ?? 2000, this.month - 1, this.day);
        return (
            date.getFullYear() === (this.year ?? 2000) &&
            date.getMonth() === this.month - 1 &&
            date.getDate() === this.day
        );
    }

    beforeSave(): void {
        if (!this.isValidDate) {
            throw new Error("Invalid date: The combination of year, month, and day is not a valid date.");
        }
    }

    beforeUpdate(): void {
        if (!this.isValidDate) {
            throw new Error("Invalid date: The combination of year, month, and day is not a valid date.");
        }
    }
}
