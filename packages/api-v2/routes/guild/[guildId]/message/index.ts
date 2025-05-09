import { Request, Response, Router, NextFunction } from 'express';
import { Messages, Guild, User } from '../../../../models';

const router = Router();

/**
 * @swagger
 * /guild/{guildId}/message:
 *   get:
 *     summary: Get messages for a specific guild
 *     tags:
 *       - Guild Messages
 *     parameters:
 *       - name: guildId
 *         in: path
 *         required: true
 *         description: The ID of the guild to fetch messages for.
 *         schema:
 *           type: integer
 *       - name: startDate
 *         in: query
 *         required: false
 *         description: Start date for filtering messages (YYYY-MM-DD format).
 *         schema:
 *           type: string
 *       - name: endDate
 *         in: query
 *         required: false
 *         description: End date for filtering messages (YYYY-MM-DD format).
 *         schema:
 *           type: string
 *       - name: channelId
 *         in: query
 *         required: false
 *         description: The ID of the channel to filter messages by.
 *         schema:
 *           type: integer
 *       - name: userId
 *         in: query
 *         required: false
 *         description: The ID of the user to filter messages by.
 *         schema:
 *           type: integer
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { guildId } = req.params;
        const { startDate, endDate, channelId, userId } = req.query;

        // Build options for the query
        const options: any = {};

        // Parse channelId if provided
        if (channelId) {
            options.channelId = channelId;
        }

        // Parse userId if provided
        if (userId) {
            options.userId = userId;
        }

        // Parse date range if both start and end dates are provided
        if (startDate && endDate) {
            options.dateRange = {
                startDate: new Date(startDate as string),
                endDate: new Date(endDate as string)
            };
        }

        // Fetch messages using the findByGuildId method
        const messages = await Messages.findByGuildId(guildId, options);

        res.status(200).json({
            success: true,
            data: messages
        });

    } catch (error) {
        next(error);
    }
});



export default router;