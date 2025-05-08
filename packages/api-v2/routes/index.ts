import { Request, Response, Router } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        name: "Sero Discord Bot API",
        version: "2.0.0",
        authors: ["Lars", "Mathijs"],
        message: 'Successfully connected',
        documentation: '/docs'
    });
});

export default router;