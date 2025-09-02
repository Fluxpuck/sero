import { Sequelize } from "sequelize-typescript";

// Import all models
import { BotConfig } from "./bot-config.model";
import { User } from "./user.model";
import { Guild } from "./guilds.model";
import { GuildSettings } from "./guild-settings.model";
import { UserLevel } from "./user-levels.model";
import { UserBirthdays } from "./user-birthdays.model";
import { UserBalances } from "./user-balances.model";
import { UserCareers } from "./user-careers.model";
import { UserAuditLogs } from "./user-audit-logs.model";
import { UserActivityLogs } from "./user-activity-logs.model";
import { UserEconomyLogs } from "./user-economy-logs.model";
import { UserExperienceLogs } from "./user-experience-logs.model";
import { UserVoiceLogs } from "./user-voice-logs.model"; // This filename should be fixed
import { TemporaryRole } from "./temporary-roles.model";
import { TemporaryBan } from "./temporary-bans.model";
import { Level } from "./levels.model";
import { LevelRank } from "./level-ranks.model";
import { Commands } from "./commands.model";
import { CommandLogs } from "./command-logs.model";
import { Aways } from "./aways.model";
import { Messages } from "./messages.model";
import { Modifier } from "./modifiers.model";
import { Jobs } from "./jobs.model";
import {
  TemplateMessages,
  TemplateMessagesType,
} from "./template-messages.model";
import { PrereasonMessages, ModerationType } from "./prereason-messages.model";
import { JobMessages } from "./job-messages.model";

// Export all models
export {
  BotConfig,
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
  TemporaryBan,
  Level,
  LevelRank,
  Commands,
  CommandLogs,
  Aways,
  Messages,
  Modifier,
  Jobs,
  TemplateMessages,
  TemplateMessagesType,
  PrereasonMessages,
  ModerationType,
  JobMessages,
};

/**
 * Initialize all model relationships
 * @param sequelize The Sequelize instance
 */
export const initModels = (sequelize: Sequelize): void => {
  // Add all models to sequelize instance
  sequelize.addModels([
    BotConfig,
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
    TemporaryBan,
    Level,
    LevelRank,
    Commands,
    CommandLogs,
    Aways,
    Messages,
    Modifier,
    Jobs,
    TemplateMessages,
    PrereasonMessages,
    JobMessages,
  ]);

  // User relationships - using composite keys (userId + guildId) or the unique uuid
  User.hasOne(UserLevel, {
    foreignKey: "userId",
    constraints: false,
    scope: {
      guildId: { $col: "User.guildId" },
    },
  });
  User.hasOne(UserBirthdays, {
    foreignKey: "userId",
    constraints: false,
    scope: {
      guildId: { $col: "User.guildId" },
    },
  });
  User.hasOne(UserBalances, {
    foreignKey: "userId",
    constraints: false,
    scope: {
      guildId: { $col: "User.guildId" },
    },
  });
  User.hasMany(UserCareers, {
    foreignKey: "userId",
    constraints: false,
    scope: {
      guildId: { $col: "User.guildId" },
    },
  });
  // Define executor relationship from User side
  User.hasMany(UserAuditLogs, {
    foreignKey: "executorId",
    sourceKey: "userId",
    as: "executedAuditLogs",
    constraints: false,
  });
  
  // Define target relationship from User side
  User.hasMany(UserAuditLogs, {
    foreignKey: "targetId",
    sourceKey: "userId",
    as: "targetedAuditLogs",
    constraints: false,
  });
  
  // Define relationship between UserAuditLogs and TemporaryBan
  UserAuditLogs.hasOne(TemporaryBan, {
    foreignKey: "auditLogId",
    constraints: false,
  });
  User.hasMany(UserActivityLogs, {
    foreignKey: "userId",
    constraints: false,
    scope: {
      guildId: { $col: "User.guildId" },
    },
  });
  User.hasMany(UserEconomyLogs, {
    foreignKey: "userId",
    constraints: false,
    scope: {
      guildId: { $col: "User.guildId" },
    },
  });
  User.hasMany(UserExperienceLogs, {
    foreignKey: "userId",
    constraints: false,
    scope: {
      guildId: { $col: "User.guildId" },
    },
  });
  User.hasMany(UserVoiceLogs, {
    foreignKey: "userId",
    constraints: false,
    scope: {
      guildId: { $col: "User.guildId" },
    },
  });
  User.hasMany(TemporaryRole, {
    foreignKey: "userId",
    constraints: false,
    scope: {
      guildId: { $col: "User.guildId" },
    },
  });
  User.hasMany(TemporaryBan, {
    foreignKey: "userId",
    constraints: false,
    scope: {
      guildId: { $col: "User.guildId" },
    },
  });
  User.hasMany(CommandLogs, {
    foreignKey: "executorId",
    constraints: false,
    scope: {
      guildId: { $col: "User.guildId" },
    },
  });
  User.hasMany(Aways, {
    foreignKey: "userId",
    constraints: false,
    scope: {
      guildId: { $col: "User.guildId" },
    },
  });

  // Guild relationships
  Guild.hasMany(User, {
    foreignKey: "guildId",
    sourceKey: "guildId",
    constraints: false,
  });
  Guild.hasMany(GuildSettings, {
    foreignKey: "guildId",
    sourceKey: "guildId",
    constraints: false,
  });
  Guild.hasMany(UserLevel, {
    foreignKey: "guildId",
    sourceKey: "guildId",
    constraints: false,
  });
  Guild.hasMany(UserBirthdays, {
    foreignKey: "guildId",
    sourceKey: "guildId",
    constraints: false,
  });
  Guild.hasMany(UserBalances, {
    foreignKey: "guildId",
    sourceKey: "guildId",
    constraints: false,
  });
  Guild.hasMany(UserCareers, {
    foreignKey: "guildId",
    sourceKey: "guildId",
    constraints: false,
  });
  Guild.hasMany(UserAuditLogs, {
    foreignKey: "guildId",
    sourceKey: "guildId",
    constraints: false,
  });
  Guild.hasMany(UserActivityLogs, {
    foreignKey: "guildId",
    sourceKey: "guildId",
    constraints: false,
  });
  Guild.hasMany(UserEconomyLogs, {
    foreignKey: "guildId",
    sourceKey: "guildId",
    constraints: false,
  });
  Guild.hasMany(UserExperienceLogs, {
    foreignKey: "guildId",
    sourceKey: "guildId",
    constraints: false,
  });
  Guild.hasMany(UserVoiceLogs, {
    foreignKey: "guildId",
    sourceKey: "guildId",
    constraints: false,
  });
  Guild.hasMany(TemporaryRole, {
    foreignKey: "guildId",
    constraints: false,
  });
  Guild.hasMany(TemporaryBan, {
    foreignKey: "guildId",
    constraints: false,
  });
  Guild.hasMany(CommandLogs, {
    foreignKey: "guildId",
    sourceKey: "guildId",
    constraints: false,
  });
  Guild.hasMany(Aways, {
    foreignKey: "guildId",
    sourceKey: "guildId",
    constraints: false,
  });
  Guild.hasMany(Messages, {
    foreignKey: "guildId",
    sourceKey: "guildId",
    constraints: false,
  });
  Guild.hasMany(Modifier, {
    foreignKey: "guildId",
    sourceKey: "guildId",
    constraints: false,
  });
  Guild.hasMany(TemplateMessages, {
    foreignKey: "guildId",
    sourceKey: "guildId",
    constraints: false,
  });

  // Level relationships
  Level.hasMany(UserLevel, { foreignKey: "level", constraints: false });

  // LevelRank relationships
  LevelRank.belongsTo(Guild, { foreignKey: "guildId", constraints: false });

  // Command relationships
  Commands.hasMany(CommandLogs, {
    foreignKey: "commandId",
    constraints: false,
  });

  // Jobs relationships
  Jobs.hasMany(JobMessages, { foreignKey: "jobId", constraints: false });

  // Reverse relationships
  UserLevel.belongsTo(User, {
    foreignKey: "userId",
    constraints: false,
    scope: {
      guildId: { $col: "UserLevel.guildId" },
    },
  });
  UserLevel.belongsTo(Guild, { foreignKey: "guildId", constraints: false });
  UserLevel.belongsTo(Level, { foreignKey: "level", constraints: false });

  UserBirthdays.belongsTo(User, {
    foreignKey: "userId",
    constraints: false,
    scope: {
      guildId: { $col: "UserBirthdays.guildId" },
    },
  });
  UserBirthdays.belongsTo(Guild, { foreignKey: "guildId", constraints: false });

  UserBalances.belongsTo(User, {
    foreignKey: "userId",
    constraints: false,
    scope: {
      guildId: { $col: "UserBalances.guildId" },
    },
  });
  UserBalances.belongsTo(Guild, { foreignKey: "guildId", constraints: false });

  UserCareers.belongsTo(User, {
    foreignKey: "userId",
    constraints: false,
    scope: {
      guildId: { $col: "UserCareers.guildId" },
    },
  });
  UserCareers.belongsTo(Guild, { foreignKey: "guildId", constraints: false });
  UserCareers.belongsTo(Jobs, { foreignKey: "jobId", constraints: false });

  // Define executor relationship
  UserAuditLogs.belongsTo(User, {
    foreignKey: "executorId",
    targetKey: "userId",
    as: "executor",
    constraints: false,
  });
  
  // Define target relationship
  UserAuditLogs.belongsTo(User, {
    foreignKey: "targetId",
    targetKey: "userId",
    as: "target",
    constraints: false,
  });
  UserAuditLogs.belongsTo(Guild, { foreignKey: "guildId", constraints: false });

  UserActivityLogs.belongsTo(User, {
    foreignKey: "userId",
    constraints: false,
    scope: {
      guildId: { $col: "UserActivityLogs.guildId" },
    },
  });
  UserActivityLogs.belongsTo(Guild, {
    foreignKey: "guildId",
    constraints: false,
  });

  UserEconomyLogs.belongsTo(User, {
    foreignKey: "userId",
    constraints: false,
    scope: {
      guildId: { $col: "UserEconomyLogs.guildId" },
    },
  });
  UserEconomyLogs.belongsTo(Guild, {
    foreignKey: "guildId",
    constraints: false,
  });

  UserExperienceLogs.belongsTo(User, {
    foreignKey: "userId",
    constraints: false,
    scope: {
      guildId: { $col: "UserExperienceLogs.guildId" },
    },
  });
  UserExperienceLogs.belongsTo(Guild, {
    foreignKey: "guildId",
    constraints: false,
  });

  UserVoiceLogs.belongsTo(User, {
    foreignKey: "userId",
    constraints: false,
    scope: {
      guildId: { $col: "UserVoiceLogs.guildId" },
    },
  });
  UserVoiceLogs.belongsTo(Guild, { foreignKey: "guildId", constraints: false });

  TemporaryRole.belongsTo(User, {
    foreignKey: "userId",
    constraints: false,
    scope: {
      guildId: { $col: "TemporaryRole.guildId" },
    },
  });
  TemporaryRole.belongsTo(Guild, { foreignKey: "guildId", constraints: false });

  TemporaryBan.belongsTo(User, {
    foreignKey: "userId",
    constraints: false,
    scope: {
      guildId: { $col: "TemporaryBan.guildId" },
    },
  });
  TemporaryBan.belongsTo(Guild, { foreignKey: "guildId", constraints: false });
  TemporaryBan.belongsTo(UserAuditLogs, { foreignKey: "auditLogId", constraints: false });

  CommandLogs.belongsTo(User, {
    foreignKey: "executorId",
    constraints: false,
    scope: {
      guildId: { $col: "CommandLogs.guildId" },
    },
  });
  CommandLogs.belongsTo(Guild, { foreignKey: "guildId", constraints: false });
  CommandLogs.belongsTo(Commands, {
    foreignKey: "commandId",
    constraints: false,
  });

  Aways.belongsTo(User, {
    foreignKey: "userId",
    constraints: false,
    scope: {
      guildId: { $col: "Aways.guildId" },
    },
  });
  Aways.belongsTo(Guild, { foreignKey: "guildId", constraints: false });

  GuildSettings.belongsTo(Guild, { foreignKey: "guildId", constraints: false });

  Messages.belongsTo(Guild, { foreignKey: "guildId", constraints: false });

  Modifier.belongsTo(Guild, { foreignKey: "guildId", constraints: false });

  TemplateMessages.belongsTo(Guild, {
    foreignKey: "guildId",
    constraints: false,
  });

  JobMessages.belongsTo(Jobs, { foreignKey: "jobId", constraints: false });
};
