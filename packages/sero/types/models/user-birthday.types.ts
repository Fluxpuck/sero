/**
 * User Birthday type
 */
export interface UserBirthday {
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
}

/**
 * Upcoming User Birthday type
 */
export interface UpcomingUserBirthday extends UserBirthday {
  upcomingDate: string;
  daysUntil: number;
}
