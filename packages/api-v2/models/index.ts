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

    // Initialize all model relationships    // Guild relationships
    Guild.hasMany(User, { foreignKey: 'guildId', sourceKey: 'guildId', as: 'users' });
    Guild.hasOne(GuildSettings, { foreignKey: 'guildId', sourceKey: 'guildId', as: 'settings' });
    Guild.hasMany(UserLevel, { foreignKey: 'guildId', sourceKey: 'guildId', as: 'userLevels' });
    Guild.hasMany(TemporaryRole, { foreignKey: 'guildId', sourceKey: 'guildId', as: 'temporaryRoles' });
    Guild.hasMany(CommandLogs, { foreignKey: 'guildId', sourceKey: 'guildId', as: 'commandLogs' });
    Guild.hasMany(Messages, { foreignKey: 'guildId', sourceKey: 'guildId', as: 'messages' });
    Guild.hasMany(Aways, { foreignKey: 'guildId', sourceKey: 'guildId', as: 'aways' });

    // User relationships
    User.belongsTo(Guild, { foreignKey: 'guildId', targetKey: 'guildId' });
    User.hasOne(UserLevel, { foreignKey: 'userUuid', sourceKey: 'uuid', as: 'level' });
    User.hasOne(UserBirthdays, { foreignKey: 'userUuid', sourceKey: 'uuid', as: 'birthday' });
    User.hasOne(UserBalances, { foreignKey: 'userUuid', sourceKey: 'uuid', as: 'balance' });
    User.hasMany(UserCareers, { foreignKey: 'userUuid', sourceKey: 'uuid', as: 'careers' });
    User.hasMany(UserAuditLogs, { foreignKey: 'userUuid', sourceKey: 'uuid', as: 'auditLogs' });
    User.hasMany(UserActivityLogs, { foreignKey: 'userUuid', sourceKey: 'uuid', as: 'activityLogs' });
    User.hasMany(UserEconomyLogs, { foreignKey: 'userUuid', sourceKey: 'uuid', as: 'economyLogs' });
    User.hasMany(UserExperienceLogs, { foreignKey: 'userUuid', sourceKey: 'uuid', as: 'experienceLogs' });
    User.hasMany(UserVoiceLogs, { foreignKey: 'userUuid', sourceKey: 'uuid', as: 'voiceLogs' });
    User.hasMany(TemporaryRole, { foreignKey: 'userUuid', sourceKey: 'uuid', as: 'temporaryRoles' });
    User.hasMany(CommandLogs, { foreignKey: 'executorUuid', sourceKey: 'uuid', as: 'commandLogs' });
    User.hasMany(Aways, { foreignKey: 'userUuid', sourceKey: 'uuid', as: 'aways' });
    User.hasMany(Messages, { foreignKey: 'userUuid', sourceKey: 'uuid', as: 'messages' });

    // GuildSettings relationships
    GuildSettings.belongsTo(Guild, { foreignKey: 'guildId', targetKey: 'guildId' });

    // UserLevel relationships
    UserLevel.belongsTo(User, { foreignKey: 'userUuid', targetKey: 'uuid' });
    UserLevel.belongsTo(Guild, { foreignKey: 'guildId', targetKey: 'guildId' });
    UserLevel.belongsTo(Level, { foreignKey: 'level', targetKey: 'level', as: 'levelDetails' });

    // Level relationships
    Level.hasMany(UserLevel, { foreignKey: 'level', sourceKey: 'level', as: 'userLevels' });
    Level.hasMany(LevelRank, { foreignKey: 'level', sourceKey: 'level', as: 'ranks' });

    // LevelRank relationships
    LevelRank.belongsTo(Level, { foreignKey: 'level', targetKey: 'level' });
    LevelRank.belongsTo(Guild, { foreignKey: 'guildId', targetKey: 'guildId' });

    // Command relationships
    Commands.hasMany(CommandLogs, { foreignKey: 'commandId', sourceKey: 'commandId', as: 'logs' });

    // CommandLog relationships
    CommandLogs.belongsTo(Commands, { foreignKey: 'commandId', targetKey: 'commandId', as: 'command' });
    CommandLogs.belongsTo(User, { foreignKey: 'executorUuid', targetKey: 'uuid', as: 'executor' });
    CommandLogs.belongsTo(Guild, { foreignKey: 'guildId', targetKey: 'guildId' });

    // UserBirthdays relationships
    UserBirthdays.belongsTo(User, { foreignKey: 'userUuid', targetKey: 'uuid' });
    UserBirthdays.belongsTo(Guild, { foreignKey: 'guildId', targetKey: 'guildId' });

    // UserBalances relationships
    UserBalances.belongsTo(User, { foreignKey: 'userUuid', targetKey: 'uuid' });
    UserBalances.belongsTo(Guild, { foreignKey: 'guildId', targetKey: 'guildId' });

    // UserCareers relationships
    UserCareers.belongsTo(User, { foreignKey: 'userUuid', targetKey: 'uuid' });
    UserCareers.belongsTo(Guild, { foreignKey: 'guildId', targetKey: 'guildId' });
    UserCareers.belongsTo(Jobs, { foreignKey: 'jobId', targetKey: 'id', as: 'jobDetails' });

    // Jobs relationships
    Jobs.hasMany(UserCareers, { foreignKey: 'jobId', sourceKey: 'id', as: 'careers' });

    // UserAuditLogs relationships
    UserAuditLogs.belongsTo(User, { foreignKey: 'userUuid', targetKey: 'uuid' });
    UserAuditLogs.belongsTo(Guild, { foreignKey: 'guildId', targetKey: 'guildId' });

    // UserActivityLogs relationships
    UserActivityLogs.belongsTo(User, { foreignKey: 'userUuid', targetKey: 'uuid' });
    UserActivityLogs.belongsTo(Guild, { foreignKey: 'guildId', targetKey: 'guildId' });

    // UserEconomyLogs relationships
    UserEconomyLogs.belongsTo(User, { foreignKey: 'userUuid', targetKey: 'uuid' });
    UserEconomyLogs.belongsTo(Guild, { foreignKey: 'guildId', targetKey: 'guildId' });

    // UserExperienceLogs relationships
    UserExperienceLogs.belongsTo(User, { foreignKey: 'userUuid', targetKey: 'uuid' });
    UserExperienceLogs.belongsTo(Guild, { foreignKey: 'guildId', targetKey: 'guildId' });

    // UserVoiceLogs relationships
    UserVoiceLogs.belongsTo(User, { foreignKey: 'userUuid', targetKey: 'uuid' });
    UserVoiceLogs.belongsTo(Guild, { foreignKey: 'guildId', targetKey: 'guildId' });

    // TemporaryRole relationships
    TemporaryRole.belongsTo(User, { foreignKey: 'userUuid', targetKey: 'uuid' });
    TemporaryRole.belongsTo(Guild, { foreignKey: 'guildId', targetKey: 'guildId' });

    // Aways relationships
    Aways.belongsTo(User, { foreignKey: 'userUuid', targetKey: 'uuid' });
    Aways.belongsTo(Guild, { foreignKey: 'guildId', targetKey: 'guildId' });

    // Messages relationships
    Messages.belongsTo(User, { foreignKey: 'userUuid', targetKey: 'uuid' });
    Messages.belongsTo(Guild, { foreignKey: 'guildId', targetKey: 'guildId' });

};