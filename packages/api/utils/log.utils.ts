import { UserAuditLogs, UserActivityLogs, UserVoiceLogs } from '../models';
import { UserEconomyLogs, EconomyLogType } from '../models/user-economy-logs.model';
import { UserExperienceLogs, UserExperienceLogType } from '../models/user-experience-logs.model';

/**
 * Logs a user experience event
 * @param guildId - The ID of the guild where the event occurred
 * @param userId - The ID of the user who performed the action
 * @param type - The type of experience log
 * @param amount - The amount of experience involved
 * @param originId - Optional ID of the origin of this log (e.g., message ID, command ID)
 */
export const logUserExperience = async (
    guildId: string,
    userId: string,
    type: UserExperienceLogType,
    amount: number,
    originId: string | null = null
): Promise<UserExperienceLogs> => {
    try {
        const log = await UserExperienceLogs.create({
            guildId,
            userId,
            type,
            amount,
            originId
        } as UserExperienceLogs);

        return log;

    } catch (error) {
        console.error('Error logging user experience:', error);
        throw error;
    }
};
