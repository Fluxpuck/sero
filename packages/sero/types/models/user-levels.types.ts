/**
 * Interface for User Level data structure
 */
export interface UserLevelData {
  id: string;
  guildId: string;
  userId: string;
  fluctuation: number;
  experience: number;
  level: number;
  rank: number;
  currentLevelExp: number;
  nextLevelExp: number;
  remainingExp: number;
  createdAt: string;
  updatedAt: string;
}
