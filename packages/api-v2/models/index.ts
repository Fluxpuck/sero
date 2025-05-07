import { Sequelize } from "sequelize-typescript";
import { Guild } from "./guilds.model";
import { User } from "./user.model";
import { UserLevel } from "./user-levels.model";
import { TemporaryRole } from "./temporary-roles.model";
import { Level } from "./levels.model";
import { LevelRank } from "./level-ranks.model";
// Import other models as needed

// Export all models with updated names
export {
    Guild,
    User,
    UserLevel,
    TemporaryRole,
    Level,
    LevelRank
};

// Function to initialize models and their relationships
export const initModels = (sequelize: Sequelize): void => {
    sequelize.addModels([
        Guild,
        User,
        UserLevel,
        TemporaryRole,
        Level,
        LevelRank
    ]);

    // Guild associations
    Guild.hasMany(User, {
        foreignKey: 'guildId',
        as: 'users'
    });

    Guild.hasMany(TemporaryRole, {
        foreignKey: 'guildId',
        as: 'temporaryRoles'
    });

    Guild.hasMany(LevelRank, {
        foreignKey: 'guildId',
        as: 'levelRanks'
    });

    Guild.hasMany(UserLevel, {
        foreignKey: 'guildId',
        as: 'userLevels'
    });

    // User associations
    User.belongsTo(Guild, {
        foreignKey: 'guildId',
        as: 'guild'
    });

    User.hasMany(TemporaryRole, {
        foreignKey: 'userId',
        as: 'temporaryRoles'
    });

    User.hasOne(UserLevel, {
        foreignKey: 'userId',
        as: 'userLevel'
    });

    // Level associations
    Level.hasMany(LevelRank, {
        foreignKey: 'level',
        as: 'levelRanks'
    });

    // UserLevel associations  
    UserLevel.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });

    UserLevel.belongsTo(Guild, {
        foreignKey: 'guildId',
        as: 'guild'
    });

    // TemporaryRole associations
    TemporaryRole.belongsTo(Guild, {
        foreignKey: 'guildId',
        as: 'guild'
    });

    TemporaryRole.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });

    // LevelRank associations
    LevelRank.belongsTo(Guild, {
        foreignKey: 'guildId',
        as: 'guild'
    });

    LevelRank.belongsTo(Level, {
        foreignKey: 'level',
        as: 'level'
    });
};