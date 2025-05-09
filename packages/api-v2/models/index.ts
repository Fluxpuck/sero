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

    // Initialize all model relationships

};