import { Request, Response, Router, NextFunction } from 'express';
import { BotConfig } from '../models';
import { ResponseHandler } from '../utils/response.utils';

const router = Router();

/**
 * @swagger
 * /bot-config/{clientId}:
 *   get:
 *     summary: Get bot configuration by client ID
 *     tags:
 *       - Bot Configuration
 *     parameters:
 *       - name: clientId
 *         in: path
 *         required: true
 *         description: The client ID of the bot
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [success]
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/BotConfig'
 *       404:
 *         description: Bot configuration not found
 *       500:
 *         description: Server error
 */
router.get('/:clientId', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { clientId } = req.params;

        const botConfig = await BotConfig.findByPk(clientId);
        if (!botConfig) {
            return ResponseHandler.sendError(res, 'Client configuration not found', 404);
        }

        ResponseHandler.sendSuccess(res, botConfig, 'Client configuration retrieved successfully');
    } catch (error) {
        next(error);
    }
});

export default router;