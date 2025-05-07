import { Sequelize } from "sequelize-typescript";
import { Guilds } from "./guilds.model";
import { Users } from "./user.model";
import { Modifiers } from "./modifiers.model";

// Export all models
export { Guilds, Users, Modifiers };

// Function to initialize models and their relationships
export const initModels = (sequelize: Sequelize): void => {
    sequelize.addModels([Guilds, Users, Modifiers]);

    // Define associations between models

    // Guild associations
    Guilds.hasMany(Users, {
        foreignKey: 'guildId',
        as: 'users'
    });

    Guilds.hasMany(Modifiers, {
        foreignKey: 'guildId',
        as: 'modifiers'
    });

    // User associations
    Users.belongsTo(Guilds, {
        foreignKey: 'guildId',
        as: 'guild'
    });

    Users.hasMany(Modifiers, {
        foreignKey: 'userId',
        as: 'modifiers'
    });

    // Modifier associations
    Modifiers.belongsTo(Guilds, {
        foreignKey: 'guildId',
        as: 'guild'
    });

    Modifiers.belongsTo(Users, {
        foreignKey: 'userId',
        as: 'user'
    });
};