/**
 * Enum for user types
 */
export enum UserType {
  ADMIN = "admin",
  MODERATOR = "moderator",
  USER = "user",
}

/**
 * Interface for User data included in audit logs
 */
export interface UserData {
  id: number;
  uuid: string;
  userId: string;
  username: string;
  userType: UserType;
  premium: boolean;
  moderatorSince: Date | null;
}
