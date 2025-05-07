import { Request, Response, Router, NextFunction } from 'express';
import { User } from '../../models/user.model';

const router = Router();

router.get('/guild/:guildId/users', async (req: Request, res: Response, next: NextFunction) => {
    const { guildId } = req.params;

    try {
        const users = await User.findAll({
            where: { guildId },
            order: [['createdAt', 'DESC']]
        });

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        next(error);
    }
});

export default router;