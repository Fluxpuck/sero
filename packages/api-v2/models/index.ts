import { Sequelize } from "sequelize-typescript";

// Import all models
import { User } from './user.model';
import { Guild } from './guilds.model';
import { GuildSettings } from './guild-settings.model';
import { UserLevel } from './user-levels.model';
import { UserBirthdays } from './user-birthdays.model';
import { UserBalances } from './user-balances.model';
import { UserCareers } from './user-careers.model';
import { UserAuditLogs } from './user-audit-logs.model';
import { UserActivityLogs } from './user-activity-logs.model';
import { UserEconomyLogs } from './user-economy-logs.model';
import { UserExperienceLogs } from './user-experience-logs.model';
import { UserVoiceLogs } from './user-voice-logs.model'; // This filename should be fixed
import { TemporaryRole } from './temporary-roles.model';
import { Level } from './levels.model';
import { LevelRank } from './level-ranks.model';
import { Commands } from './commands.model';
import { CommandLogs } from './command-logs.model';
import { Aways } from './aways.model';
import { Messages } from './messages.model';
import { Modifiers } from './modifiers.model';
import { Jobs } from './jobs.model';

// Export all models
export {
    User,
    Guild,
    GuildSettings,
    UserLevel,
    UserBirthdays,
    UserBalances,
    UserCareers,
    UserAuditLogs,
    UserActivityLogs,
    UserEconomyLogs,
    UserExperienceLogs,
    UserVoiceLogs,
    TemporaryRole,
    Level,
    LevelRank,
    Commands,
    CommandLogs,
    Aways,
    Messages,
    Modifiers,
    Jobs
};

/**
 * Initialize all model relationships
 * @param sequelize The Sequelize instance
 */
export const initModels = (sequelize: Sequelize): void => {
    // Add all models to sequelize instance
    sequelize.addModels([
        User,
        Guild,
        GuildSettings,
        UserLevel,
        UserBirthdays,
        UserBalances,
        UserCareers,
        UserAuditLogs,
        UserActivityLogs,
        UserEconomyLogs,
        UserExperienceLogs,
        UserVoiceLogs,
        TemporaryRole,
        Level,
        LevelRank,
        Commands,
        CommandLogs,
        Aways,
        Messages,
        Modifiers,
    ]);

    // Guild relationships
    Guild.hasMany(User, { foreignKey: 'guildId', sourceKey: 'guildId', as: 'users' });
    Guild.hasMany(GuildSettings, { foreignKey: 'guildId', sourceKey: 'guildId', as: 'settings' });
    Guild.hasMany(UserLevel, { foreignKey: 'guildId', sourceKey: 'guildId', as: 'userLevels' });
    Guild.hasMany(TemporaryRole, { foreignKey: 'guildId', sourceKey: 'guildId', as: 'temporaryRoles' });
    Guild.hasMany(CommandLogs, { foreignKey: 'guildId', sourceKey: 'guildId', as: 'commandLogs' });
    Guild.hasMany(Aways, { foreignKey: 'guildId', sourceKey: 'guildId', as: 'aways' });
    Guild.hasMany(Messages, { foreignKey: 'guildId', sourceKey: 'guildId', as: 'messages' });
    Guild.hasMany(Modifiers, { foreignKey: 'guildId', sourceKey: 'guildId', as: 'modifiers' });

    // User relationships
    User.belongsTo(Guild, { foreignKey: 'guildId', targetKey: 'guildId', as: 'guild' });
    User.hasOne(UserLevel, { foreignKey: 'userId', sourceKey: 'userId', as: 'level' });
    User.hasOne(UserBirthdays, { foreignKey: 'userId', sourceKey: 'userId', as: 'birthday' });
    User.hasOne(UserBalances, { foreignKey: 'userId', sourceKey: 'userId', as: 'balances' });
    User.hasOne(UserCareers, { foreignKey: 'userId', sourceKey: 'userId', as: 'career' });
    User.hasOne(Aways, { foreignKey: 'userId', sourceKey: 'userId', as: 'aways' });
    User.hasMany(Messages, { foreignKey: 'userId', sourceKey: 'userId', as: 'messages' });
    User.hasMany(UserAuditLogs, { foreignKey: 'userId', sourceKey: 'userId', as: 'auditLogs' });
    User.hasMany(UserActivityLogs, { foreignKey: 'userId', sourceKey: 'userId', as: 'activityLogs' });
    User.hasMany(UserEconomyLogs, { foreignKey: 'userId', sourceKey: 'userId', as: 'economyLogs' });
    User.hasMany(UserExperienceLogs, { foreignKey: 'userId', sourceKey: 'userId', as: 'experienceLogs' });
    User.hasMany(UserVoiceLogs, { foreignKey: 'userId', sourceKey: 'userId', as: 'voiceLogs' });
    User.hasMany(TemporaryRole, { foreignKey: 'userId', sourceKey: 'userId', as: 'temporaryRoles' });
    User.hasMany(CommandLogs, { foreignKey: 'executorId', sourceKey: 'userId', as: 'commandsExecuted' });

    // UserLevel relationships
    UserLevel.belongsTo(User, { foreignKey: 'userId', targetKey: 'userId', as: 'user' });
    UserLevel.belongsTo(Guild, { foreignKey: 'guildId', targetKey: 'guildId', as: 'guild' });

    // Level relationships
    Level.hasMany(LevelRank, { foreignKey: 'level', sourceKey: 'level', as: 'ranks' });

    // LevelRank relationships
    LevelRank.belongsTo(Level, { foreignKey: 'level', targetKey: 'level', as: 'levelInfo' });

    // Commands relationships
    Commands.hasMany(CommandLogs, { foreignKey: 'commandId', sourceKey: 'commandId', as: 'logs' });

    // CommandLogs relationships
    CommandLogs.belongsTo(Commands, { foreignKey: 'commandId', targetKey: 'commandId', as: 'command' });
    CommandLogs.belongsTo(User, { foreignKey: 'executorId', targetKey: 'userId', as: 'executor' });
    CommandLogs.belongsTo(Guild, { foreignKey: 'guildId', targetKey: 'guildId', as: 'guild' });

    // TemporaryRole relationships
    TemporaryRole.belongsTo(User, { foreignKey: 'userId', targetKey: 'userId', as: 'user' });
    TemporaryRole.belongsTo(Guild, { foreignKey: 'guildId', targetKey: 'guildId', as: 'guild' });

    // GuildSettings relationships
    GuildSettings.belongsTo(Guild, { foreignKey: 'guildId', targetKey: 'guildId', as: 'guild' });

    // User detail relationships
    UserBirthdays.belongsTo(User, { foreignKey: 'userId', targetKey: 'userId', as: 'user' });
    UserBalances.belongsTo(User, { foreignKey: 'userId', targetKey: 'userId', as: 'user' });
    UserCareers.belongsTo(User, { foreignKey: 'userId', targetKey: 'userId', as: 'user' });

    // User logs relationships
    UserAuditLogs.belongsTo(User, { foreignKey: 'userId', targetKey: 'userId', as: 'user' });
    UserActivityLogs.belongsTo(User, { foreignKey: 'userId', targetKey: 'userId', as: 'user' });
    UserEconomyLogs.belongsTo(User, { foreignKey: 'userId', targetKey: 'userId', as: 'user' });
    UserExperienceLogs.belongsTo(User, { foreignKey: 'userId', targetKey: 'userId', as: 'user' });
    UserVoiceLogs.belongsTo(User, { foreignKey: 'userId', targetKey: 'userId', as: 'user' });

    // Aways relationships
    Aways.belongsTo(User, { foreignKey: 'userId', targetKey: 'userId', as: 'user' });
    Aways.belongsTo(Guild, { foreignKey: 'guildId', targetKey: 'guildId', as: 'guild' });

    // Messages relationships
    Messages.belongsTo(User, { foreignKey: 'userId', targetKey: 'userId', as: 'user' });
    Messages.belongsTo(Guild, { foreignKey: 'guildId', targetKey: 'guildId', as: 'guild' });

    // Modifiers relationships
    Modifiers.belongsTo(Guild, { foreignKey: 'guildId', targetKey: 'guildId', as: 'guild' });

};