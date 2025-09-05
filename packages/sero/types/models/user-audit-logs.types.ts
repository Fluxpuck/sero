import { AuditLogEvent } from "discord.js";
import { UserData } from "./user.types";

/**
 * Custom audit log events that extend Discord's built-in audit log events
 */
export enum CustomAuditLogEvent {
  MemberTimeoutAdd = "MemberTimeoutAdd",
  MemberTimeoutRemove = "MemberTimeoutRemove",
}

/**
 * Combined type for all possible audit log event types
 */
export type AuditLogEventType = AuditLogEvent | CustomAuditLogEvent;

/**
 * Interface for User Audit Log data structure
 */
export interface UserAuditLog {
  id: string;
  guildId: string;
  action: AuditLogEventType;
  reason: string | null;
  targetId: string;
  executorId: string;
  duration: number | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for User Audit Log with associated user data
 */
export interface UserAuditLogWithUsers extends UserAuditLog {
  executor?: UserData;
  target?: UserData;
}
