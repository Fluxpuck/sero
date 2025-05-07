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
        Jobs
    ]);

    // ----------------
    // Guild associations
    // ----------------
    Guild.hasMany(User, {
        foreignKey: 'guildId',
        as: 'users'
    });

    Guild.hasMany(GuildSettings, {
        foreignKey: 'guildId',
        as: 'settings'
    });

    Guild.hasMany(UserLevel, {
        foreignKey: 'guildId',
        as: 'userLevels'
    });

    Guild.hasMany(LevelRank, {
        foreignKey: 'guildId',
        as: 'levelRanks'
    });

    Guild.hasMany(TemporaryRole, {
        foreignKey: 'guildId',
        as: 'temporaryRoles'
    });

    Guild.hasMany(UserAuditLogs, {
        foreignKey: 'guildId',
        as: 'auditLogs'
    });

    Guild.hasMany(UserActivityLogs, {
        foreignKey: 'guildId',
        as: 'activityLogs'
    });

    Guild.hasMany(UserEconomyLogs, {
        foreignKey: 'guildId',
        as: 'economyLogs'
    });

    Guild.hasMany(UserExperienceLogs, {
        foreignKey: 'guildId',
        as: 'experienceLogs'
    });

    Guild.hasMany(UserVoiceLogs, {
        foreignKey: 'guildId',
        as: 'voiceLogs'
    });

    Guild.hasMany(CommandLogs, {
        foreignKey: 'guildId',
        as: 'commandLogs'
    });

    Guild.hasMany(Aways, {
        foreignKey: 'guildId',
        as: 'aways'
    });

    Guild.hasMany(Messages, {
        foreignKey: 'guildId',
        as: 'messages'
    });

    Guild.hasMany(Modifiers, {
        foreignKey: 'guildId',
        as: 'modifiers'
    });

    // ----------------
    // User associations 
    // ----------------
    User.belongsTo(Guild, {
        foreignKey: 'guildId',
        as: 'guild'
    });

    User.hasOne(UserLevel, {
        foreignKey: 'userId',
        as: 'level'
    });

    User.hasOne(UserBirthdays, {
        foreignKey: 'userId',
        as: 'birthday'
    });

    User.hasOne(UserBalances, {
        foreignKey: 'userId',
        as: 'balance'
    });

    User.hasOne(UserCareers, {
        foreignKey: 'userId',
        as: 'career'
    });

    User.hasMany(UserAuditLogs, {
        foreignKey: 'userId',
        as: 'auditLogs'
    });

    User.hasMany(UserAuditLogs, {
        foreignKey: 'executorId',
        as: 'executedAuditLogs'
    });

    User.hasMany(UserActivityLogs, {
        foreignKey: 'userId',
        as: 'activityLogs'
    });

    User.hasMany(UserEconomyLogs, {
        foreignKey: 'userId',
        as: 'economyLogs'
    });

    User.hasMany(UserExperienceLogs, {
        foreignKey: 'userId',
        as: 'experienceLogs'
    });

    User.hasMany(UserVoiceLogs, {
        foreignKey: 'userId',
        as: 'voiceLogs'
    });

    User.hasMany(TemporaryRole, {
        foreignKey: 'userId',
        as: 'temporaryRoles'
    });

    User.hasMany(CommandLogs, {
        foreignKey: 'executorId',
        as: 'executedCommands'
    });

    User.hasOne(Aways, {
        foreignKey: 'userId',
        as: 'away'
    });

    User.hasMany(Messages, {
        foreignKey: 'userId',
        as: 'messages'
    });

    User.hasMany(Modifiers, {
        foreignKey: 'userId',
        as: 'modifiers'
    });

    // ----------------
    // UserLevel associations
    // ----------------
    UserLevel.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });

    UserLevel.belongsTo(Guild, {
        foreignKey: 'guildId',
        as: 'guild'
    });

    // ----------------
    // UserBirthdays associations
    // ----------------
    UserBirthdays.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });

    UserBirthdays.belongsTo(Guild, {
        foreignKey: 'guildId',
        as: 'guild'
    });

    // ----------------
    // UserBalances associations
    // ----------------
    UserBalances.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });

    UserBalances.belongsTo(Guild, {
        foreignKey: 'guildId',
        as: 'guild'
    });

    // ----------------
    // UserCareers associations
    // ----------------
    UserCareers.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });

    UserCareers.belongsTo(Guild, {
        foreignKey: 'guildId',
        as: 'guild'
    });

    UserCareers.belongsTo(Jobs, {
        foreignKey: 'jobId',
        as: 'job'
    });

    // ----------------
    // Jobs associations
    // ----------------
    Jobs.hasMany(UserCareers, {
        foreignKey: 'jobId',
        as: 'careers'
    });

    // ----------------
    // Audit Logs associations
    // ----------------
    UserAuditLogs.belongsTo(Guild, {
        foreignKey: 'guildId',
        as: 'guild'
    });

    UserAuditLogs.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });

    UserAuditLogs.belongsTo(User, {
        foreignKey: 'executorId',
        as: 'executor'
    });

    // ----------------
    // Activity Logs associations
    // ----------------
    UserActivityLogs.belongsTo(Guild, {
        foreignKey: 'guildId',
        as: 'guild'
    });

    UserActivityLogs.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });

    // ----------------
    // Economy Logs associations
    // ----------------
    UserEconomyLogs.belongsTo(Guild, {
        foreignKey: 'guildId',
        as: 'guild'
    });

    UserEconomyLogs.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });

    // ----------------
    // Experience Logs associations
    // ----------------
    UserExperienceLogs.belongsTo(Guild, {
        foreignKey: 'guildId',
        as: 'guild'
    });

    UserExperienceLogs.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });

    // ----------------
    // Voice Logs associations
    // ----------------
    UserVoiceLogs.belongsTo(Guild, {
        foreignKey: 'guildId',
        as: 'guild'
    });

    UserVoiceLogs.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });

    // ----------------
    // Level and LevelRank associations
    // ----------------
    LevelRank.belongsTo(Guild, {
        foreignKey: 'guildId',
        as: 'guild'
    });

    // ----------------
    // Commands associations
    // ----------------
    Commands.hasMany(CommandLogs, {
        foreignKey: 'commandId',
        as: 'logs'
    });

    // ----------------
    // Command Logs associations
    // ----------------
    CommandLogs.belongsTo(Commands, {
        foreignKey: 'commandId',
        as: 'command'
    });

    CommandLogs.belongsTo(Guild, {
        foreignKey: 'guildId',
        as: 'guild'
    });

    CommandLogs.belongsTo(User, {
        foreignKey: 'executorId',
        as: 'executor'
    });

    // ----------------
    // Aways associations
    // ----------------
    Aways.belongsTo(Guild, {
        foreignKey: 'guildId',
        as: 'guild'
    });

    Aways.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });

    // ----------------
    // Messages associations
    // ----------------
    Messages.belongsTo(Guild, {
        foreignKey: 'guildId',
        as: 'guild'
    });

    Messages.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });

    // ----------------
    // Modifiers associations
    // ----------------
    Modifiers.belongsTo(Guild, {
        foreignKey: 'guildId',
        as: 'guild'
    });

    Modifiers.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });

    // ----------------
    // Temporary Roles associations
    // ----------------
    TemporaryRole.belongsTo(Guild, {
        foreignKey: 'guildId',
        as: 'guild'
    });

    TemporaryRole.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });

    // ----------------
    // Guild Settings associations
    // ----------------
    GuildSettings.belongsTo(Guild, {
        foreignKey: 'guildId',
        as: 'guild'
    });
};