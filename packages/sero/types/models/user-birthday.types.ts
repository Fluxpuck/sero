import { UserData } from "./user.types";

/**
 * User Birthday type
 */
export interface UserBirthdayData {
  id: number;
  guildId: string;
  userId: string;
  year?: number;
  month: number;
  day: number;
  createdAt: string;
  updatedAt: string;
  age?: number;
  isPG?: boolean;
  locked?: boolean;
  upcomingDate?: string;
  daysUntil?: number;
  User?: UserData 
}
