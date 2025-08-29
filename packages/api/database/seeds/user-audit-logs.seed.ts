import { UserAuditLogs } from "../../models";
import { faker } from "@faker-js/faker";
import { logger } from "../../utils/logger";
import { AuditLogEvent } from "discord.js";
import { UserType } from "../../models/user.model";
import {
  CustomAuditLogEvent,
  AuditLogEventType,
} from "../../models/user-audit-logs.model";

/**
 * Seed user audit logs with realistic audit events
 */
export async function seedUserAuditLogs(count = 50) {
  try {
    // Use hardcoded guild and user data from seed files
    const guilds = [
      {
        guildId: "660103319557111808",
        guildName: "Fluxpuck's Secret Society",
        premium: true,
      },
    ];

    const users = [
      {
        userId: "270640827787771943",
        guildId: "660103319557111808",
        username: "fluxpuck",
        premium: true,
        userType: UserType.ADMIN,
      },
      {
        userId: "219371358927192064",
        guildId: "660103319557111808",
        username: "thefallenshade",
        premium: false,
        userType: UserType.MODERATOR,
      },
      {
        userId: "427614787845881877",
        guildId: "660103319557111808",
        username: "amy_y",
        premium: false,
        userType: UserType.USER,
      },
      {
        userId: "377842014290575361",
        guildId: "660103319557111808",
        username: "zakaria",
        premium: false,
        userType: UserType.USER,
      },
    ];

    // Get specific event types for moderation actions
    const auditLogEventTypes: AuditLogEventType[] = [
      AuditLogEvent.MemberKick,
      AuditLogEvent.MemberPrune,
      AuditLogEvent.MemberBanAdd,
      AuditLogEvent.MemberBanRemove,
      AuditLogEvent.MemberMove,
      AuditLogEvent.MemberDisconnect,
      CustomAuditLogEvent.MemberTimeoutAdd,
      CustomAuditLogEvent.MemberTimeoutRemove,
    ];

    // Generate random audit logs
    const randomAuditLogs = Array.from({ length: count }, () => {
      const randomGuild = faker.helpers.arrayElement(guilds);
      const randomAction = faker.helpers.arrayElement(auditLogEventTypes);
      const randomActionString =
        typeof randomAction === "string"
          ? randomAction
          : AuditLogEvent[randomAction];
      const randomTarget = faker.helpers.arrayElement(users);
      const randomExecutor = faker.helpers.arrayElement(users);

      // Calculate duration based on action type
      const duration = (() => {
        switch (randomAction) {
          case CustomAuditLogEvent.MemberTimeoutAdd:
            return faker.number.int({ min: 60, max: 7200 });
          case AuditLogEvent.MemberBanAdd:
            return 60 * 60 * 24 * 365; // 1 year in seconds
          default:
            return null;
        }
      })();

      // Generate appropriate reason based on action type
      const reason = (() => {
        switch (randomAction) {
          case CustomAuditLogEvent.MemberTimeoutAdd:
          case AuditLogEvent.MemberBanAdd:
          case AuditLogEvent.MemberKick:
            return faker.lorem.sentence();
          case AuditLogEvent.MemberDisconnect:
          case AuditLogEvent.MemberBanRemove:
            return faker.datatype.boolean(0.3) ? faker.lorem.sentence() : null;
          default:
            return null;
        }
      })();

      return {
        guildId: randomGuild.guildId,
        action: randomActionString, // Use the pre-converted string value
        reason: reason,
        targetId: randomTarget.userId,
        executorId: randomExecutor.userId,
        duration: duration,
        createdAt: faker.date.between({
          from: new Date("2025-01-01"),
          to: new Date("2025-08-29"),
        }),
      };
    });

    await UserAuditLogs.bulkCreate(randomAuditLogs as UserAuditLogs[]);
    logger.success(`${count} user audit logs have been seeded successfully.`);
    return { success: true };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`Error seeding user audit logs: ${errorMessage}`);
    return { success: false, error };
  }
}
