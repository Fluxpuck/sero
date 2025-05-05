import { Request, Response, Router } from 'express';
import { User } from '../../models/users.model';

export function parseDate(date: any): string | null {
    if (date instanceof Date) {
        return date.toISOString();
    }
    if (typeof date === 'string' && date.includes('+')) {
        return date;
    }
    // handle other cases or return a default value
    return null;
}

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const users = await User.findAll();
        const parsedUsers = users.map(user => ({
            ...user,
            createdAt: parseDate(user.createdAt),
            updatedAt: parseDate(user.updatedAt),
        }));

        console.log(users);
        console.log(parsedUsers);

        res.status(200).json(parsedUsers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
        console.log(error);
    }
});

router.get('/:userName', async (req: Request, res: Response) => {
    // Your existing code
});

export default router;